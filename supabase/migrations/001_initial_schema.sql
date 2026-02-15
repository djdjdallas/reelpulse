-- ============================================================
-- Reelytics Initial Schema
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- Profiles (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Workspaces
-- ============================================================
create table public.workspaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  plan text default 'free' not null check (plan in ('free', 'pro', 'studio')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.workspaces enable row level security;

-- ============================================================
-- Workspace Members
-- ============================================================
create table public.workspace_members (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  role text default 'owner' not null check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz default now() not null,
  unique(workspace_id, user_id)
);

alter table public.workspace_members enable row level security;

-- Workspace policies (members can see their workspaces)
create policy "Members can view workspace"
  on public.workspaces for select
  using (
    id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

create policy "Owners can update workspace"
  on public.workspaces for update
  using (
    id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

create policy "Members can view workspace members"
  on public.workspace_members for select
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

create policy "Owners can manage workspace members"
  on public.workspace_members for all
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- ============================================================
-- Auto-create workspace on profile creation
-- ============================================================
create or replace function public.handle_new_profile()
returns trigger as $$
declare
  new_workspace_id uuid;
begin
  insert into public.workspaces (name)
  values (coalesce(new.full_name, 'User') || '''s Workspace')
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute function public.handle_new_profile();

-- ============================================================
-- Series
-- ============================================================
create table public.series (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  title text not null,
  genre text,
  platform text,
  total_episodes integer default 0,
  paywall_episode integer,
  description text,
  target_audience text,
  status text default 'draft' check (status in ('draft', 'active', 'completed', 'archived')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.series enable row level security;

create policy "Members can view series"
  on public.series for select
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

create policy "Editors can insert series"
  on public.series for insert
  with check (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role in ('owner', 'editor')
    )
  );

create policy "Editors can update series"
  on public.series for update
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role in ('owner', 'editor')
    )
  );

create policy "Owners can delete series"
  on public.series for delete
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- ============================================================
-- Episodes
-- ============================================================
create table public.episodes (
  id uuid default uuid_generate_v4() primary key,
  series_id uuid references public.series on delete cascade not null,
  episode_number integer not null,
  title text,
  duration_seconds integer,
  is_free boolean default true,
  hook_timestamp_seconds integer,
  cliffhanger_timestamp_seconds integer,
  trope_tags text[] default '{}',
  script_text text,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(series_id, episode_number)
);

alter table public.episodes enable row level security;

create policy "Members can view episodes"
  on public.episodes for select
  using (
    series_id in (
      select id from public.series
      where workspace_id in (
        select workspace_id from public.workspace_members
        where user_id = auth.uid()
      )
    )
  );

create policy "Editors can insert episodes"
  on public.episodes for insert
  with check (
    series_id in (
      select id from public.series
      where workspace_id in (
        select workspace_id from public.workspace_members
        where user_id = auth.uid() and role in ('owner', 'editor')
      )
    )
  );

create policy "Editors can update episodes"
  on public.episodes for update
  using (
    series_id in (
      select id from public.series
      where workspace_id in (
        select workspace_id from public.workspace_members
        where user_id = auth.uid() and role in ('owner', 'editor')
      )
    )
  );

create policy "Owners can delete episodes"
  on public.episodes for delete
  using (
    series_id in (
      select id from public.series
      where workspace_id in (
        select workspace_id from public.workspace_members
        where user_id = auth.uid() and role = 'owner'
      )
    )
  );

-- ============================================================
-- Episode Metrics
-- ============================================================
create table public.episode_metrics (
  id uuid default uuid_generate_v4() primary key,
  episode_id uuid references public.episodes on delete cascade not null,
  date date not null,
  views integer default 0,
  watch_time_seconds integer default 0,
  avg_percent_watched numeric(5,2) default 0,
  drop_off_point_seconds integer,
  likes integer default 0,
  shares integer default 0,
  comments integer default 0,
  unlocks integer default 0,
  revenue_cents integer default 0,
  created_at timestamptz default now() not null,
  unique(episode_id, date)
);

alter table public.episode_metrics enable row level security;

create policy "Members can view episode metrics"
  on public.episode_metrics for select
  using (
    episode_id in (
      select id from public.episodes
      where series_id in (
        select id from public.series
        where workspace_id in (
          select workspace_id from public.workspace_members
          where user_id = auth.uid()
        )
      )
    )
  );

create policy "Editors can insert episode metrics"
  on public.episode_metrics for insert
  with check (
    episode_id in (
      select id from public.episodes
      where series_id in (
        select id from public.series
        where workspace_id in (
          select workspace_id from public.workspace_members
          where user_id = auth.uid() and role in ('owner', 'editor')
        )
      )
    )
  );

create policy "Editors can update episode metrics"
  on public.episode_metrics for update
  using (
    episode_id in (
      select id from public.episodes
      where series_id in (
        select id from public.series
        where workspace_id in (
          select workspace_id from public.workspace_members
          where user_id = auth.uid() and role in ('owner', 'editor')
        )
      )
    )
  );

create policy "Owners can delete episode metrics"
  on public.episode_metrics for delete
  using (
    episode_id in (
      select id from public.episodes
      where series_id in (
        select id from public.series
        where workspace_id in (
          select workspace_id from public.workspace_members
          where user_id = auth.uid() and role = 'owner'
        )
      )
    )
  );

-- ============================================================
-- Hook Scores
-- ============================================================
create table public.hook_scores (
  id uuid default uuid_generate_v4() primary key,
  episode_id uuid references public.episodes on delete cascade not null,
  score numeric(5,2),
  factors jsonb default '{}',
  calculated_at timestamptz default now() not null,
  unique(episode_id)
);

alter table public.hook_scores enable row level security;

create policy "Members can view hook scores"
  on public.hook_scores for select
  using (
    episode_id in (
      select id from public.episodes
      where series_id in (
        select id from public.series
        where workspace_id in (
          select workspace_id from public.workspace_members
          where user_id = auth.uid()
        )
      )
    )
  );

create policy "System can manage hook scores"
  on public.hook_scores for all
  using (
    episode_id in (
      select id from public.episodes
      where series_id in (
        select id from public.series
        where workspace_id in (
          select workspace_id from public.workspace_members
          where user_id = auth.uid()
        )
      )
    )
  );

-- ============================================================
-- Series Benchmarks
-- ============================================================
create table public.series_benchmarks (
  id uuid default uuid_generate_v4() primary key,
  series_id uuid references public.series on delete cascade not null,
  metric_name text not null,
  value numeric(12,2),
  calculated_at timestamptz default now() not null,
  unique(series_id, metric_name)
);

alter table public.series_benchmarks enable row level security;

create policy "Members can view series benchmarks"
  on public.series_benchmarks for select
  using (
    series_id in (
      select id from public.series
      where workspace_id in (
        select workspace_id from public.workspace_members
        where user_id = auth.uid()
      )
    )
  );

create policy "System can manage series benchmarks"
  on public.series_benchmarks for all
  using (
    series_id in (
      select id from public.series
      where workspace_id in (
        select workspace_id from public.workspace_members
        where user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- Helper function: get_series_metrics
-- ============================================================
create or replace function public.get_series_metrics(p_series_id uuid)
returns table (
  episode_number integer,
  episode_title text,
  is_free boolean,
  total_views bigint,
  avg_watch_pct numeric,
  total_revenue_cents bigint,
  total_likes bigint,
  total_shares bigint,
  total_comments bigint,
  total_unlocks bigint
) as $$
begin
  return query
  select
    e.episode_number,
    e.title as episode_title,
    e.is_free,
    coalesce(sum(em.views), 0)::bigint as total_views,
    coalesce(avg(em.avg_percent_watched), 0)::numeric as avg_watch_pct,
    coalesce(sum(em.revenue_cents), 0)::bigint as total_revenue_cents,
    coalesce(sum(em.likes), 0)::bigint as total_likes,
    coalesce(sum(em.shares), 0)::bigint as total_shares,
    coalesce(sum(em.comments), 0)::bigint as total_comments,
    coalesce(sum(em.unlocks), 0)::bigint as total_unlocks
  from public.episodes e
  left join public.episode_metrics em on em.episode_id = e.id
  where e.series_id = p_series_id
  group by e.id, e.episode_number, e.title, e.is_free
  order by e.episode_number;
end;
$$ language plpgsql security definer;

-- ============================================================
-- Indexes
-- ============================================================
create index idx_workspace_members_user on public.workspace_members(user_id);
create index idx_workspace_members_workspace on public.workspace_members(workspace_id);
create index idx_series_workspace on public.series(workspace_id);
create index idx_episodes_series on public.episodes(series_id);
create index idx_episode_metrics_episode on public.episode_metrics(episode_id);
create index idx_episode_metrics_date on public.episode_metrics(date);
create index idx_hook_scores_episode on public.hook_scores(episode_id);
create index idx_series_benchmarks_series on public.series_benchmarks(series_id);
