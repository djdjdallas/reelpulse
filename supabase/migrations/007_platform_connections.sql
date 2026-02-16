-- ============================================================
-- Platform Connections (OAuth tokens)
-- ============================================================

create table public.platform_connections (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  platform text not null check (platform in ('tiktok', 'youtube', 'reelshort')),
  platform_user_id text,
  platform_username text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  status text default 'active' not null check (status in ('active', 'expired', 'revoked', 'error')),
  last_synced_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(workspace_id, platform)
);

alter table public.platform_connections enable row level security;

create policy "Members can view platform connections"
  on public.platform_connections for select
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

create policy "Owners can manage platform connections"
  on public.platform_connections for all
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- ============================================================
-- Sync Jobs
-- ============================================================

create table public.sync_jobs (
  id uuid default uuid_generate_v4() primary key,
  connection_id uuid references public.platform_connections on delete cascade not null,
  status text default 'pending' not null check (status in ('pending', 'running', 'completed', 'failed')),
  records_synced integer default 0,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now() not null
);

alter table public.sync_jobs enable row level security;

create policy "Members can view sync jobs"
  on public.sync_jobs for select
  using (
    connection_id in (
      select id from public.platform_connections
      where workspace_id in (
        select workspace_id from public.workspace_members
        where user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- Platform Video Mappings
-- ============================================================

create table public.platform_video_mappings (
  id uuid default uuid_generate_v4() primary key,
  connection_id uuid references public.platform_connections on delete cascade not null,
  platform_video_id text not null,
  platform_video_title text,
  episode_id uuid references public.episodes on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(connection_id, platform_video_id)
);

alter table public.platform_video_mappings enable row level security;

create policy "Members can view video mappings"
  on public.platform_video_mappings for select
  using (
    connection_id in (
      select id from public.platform_connections
      where workspace_id in (
        select workspace_id from public.workspace_members
        where user_id = auth.uid()
      )
    )
  );

create policy "Editors can manage video mappings"
  on public.platform_video_mappings for all
  using (
    connection_id in (
      select id from public.platform_connections
      where workspace_id in (
        select workspace_id from public.workspace_members
        where user_id = auth.uid() and role in ('owner', 'editor')
      )
    )
  );

-- Indexes
create index idx_platform_connections_workspace on public.platform_connections(workspace_id);
create index idx_sync_jobs_connection on public.sync_jobs(connection_id);
create index idx_platform_video_mappings_connection on public.platform_video_mappings(connection_id);
create index idx_platform_video_mappings_episode on public.platform_video_mappings(episode_id);
