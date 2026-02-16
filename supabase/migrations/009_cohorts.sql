-- ============================================================
-- Cohorts
-- ============================================================

create table public.cohorts (
  id uuid default uuid_generate_v4() primary key,
  series_id uuid references public.series on delete cascade not null,
  name text not null,
  type text not null check (type in ('weekly', 'monthly', 'pre_paywall', 'post_paywall', 'custom')),
  date_from date,
  date_to date,
  config jsonb default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.cohorts enable row level security;

create policy "Members can view cohorts"
  on public.cohorts for select
  using (
    series_id in (
      select id from public.series
      where workspace_id in (
        select workspace_id from public.workspace_members
        where user_id = auth.uid()
      )
    )
  );

create policy "Editors can manage cohorts"
  on public.cohorts for all
  using (
    series_id in (
      select id from public.series
      where workspace_id in (
        select workspace_id from public.workspace_members
        where user_id = auth.uid() and role in ('owner', 'editor')
      )
    )
  );

-- ============================================================
-- Cohort Retention Data
-- ============================================================

create table public.cohort_retention (
  id uuid default uuid_generate_v4() primary key,
  cohort_id uuid references public.cohorts on delete cascade not null,
  episode_number integer not null,
  retention_pct numeric(5,2),
  views bigint default 0,
  created_at timestamptz default now() not null,
  unique(cohort_id, episode_number)
);

alter table public.cohort_retention enable row level security;

create policy "Members can view cohort retention"
  on public.cohort_retention for select
  using (
    cohort_id in (
      select id from public.cohorts
      where series_id in (
        select id from public.series
        where workspace_id in (
          select workspace_id from public.workspace_members
          where user_id = auth.uid()
        )
      )
    )
  );

create policy "Editors can manage cohort retention"
  on public.cohort_retention for all
  using (
    cohort_id in (
      select id from public.cohorts
      where series_id in (
        select id from public.series
        where workspace_id in (
          select workspace_id from public.workspace_members
          where user_id = auth.uid() and role in ('owner', 'editor')
        )
      )
    )
  );

-- Indexes
create index idx_cohorts_series on public.cohorts(series_id);
create index idx_cohort_retention_cohort on public.cohort_retention(cohort_id);
