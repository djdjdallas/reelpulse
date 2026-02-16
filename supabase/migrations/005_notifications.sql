-- ============================================================
-- Notification Preferences
-- ============================================================

create table public.notification_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null unique,
  email_enabled boolean default true not null,
  in_app_enabled boolean default true not null,
  retention_drop_threshold numeric(5,2) default 15.00,
  health_score_dip_threshold numeric(5,2) default 10.00,
  paywall_conversion_threshold numeric(5,2) default 5.00,
  weekly_digest boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.notification_preferences enable row level security;

create policy "Users can view own notification preferences"
  on public.notification_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own notification preferences"
  on public.notification_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notification preferences"
  on public.notification_preferences for update
  using (auth.uid() = user_id);

-- ============================================================
-- Notifications (in-app)
-- ============================================================

create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  type text not null check (type in ('retention_drop', 'health_score_dip', 'paywall_conversion', 'sync_complete', 'sync_error', 'experiment_result', 'team_invite', 'general')),
  title text not null,
  message text not null,
  metadata jsonb default '{}',
  read boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Service role inserts handled via service client

-- ============================================================
-- Metric Snapshots (for threshold comparison)
-- ============================================================

create table public.metric_snapshots (
  id uuid default uuid_generate_v4() primary key,
  series_id uuid references public.series on delete cascade not null,
  snapshot_date date not null,
  avg_retention numeric(5,2),
  health_score numeric(5,2),
  paywall_conversion_rate numeric(5,2),
  total_views bigint default 0,
  total_revenue_cents bigint default 0,
  metadata jsonb default '{}',
  created_at timestamptz default now() not null,
  unique(series_id, snapshot_date)
);

alter table public.metric_snapshots enable row level security;

create policy "Members can view metric snapshots"
  on public.metric_snapshots for select
  using (
    series_id in (
      select id from public.series
      where workspace_id in (
        select workspace_id from public.workspace_members
        where user_id = auth.uid()
      )
    )
  );

-- Indexes
create index idx_notifications_user_read on public.notifications(user_id, read);
create index idx_notifications_created on public.notifications(created_at desc);
create index idx_metric_snapshots_series_date on public.metric_snapshots(series_id, snapshot_date);
