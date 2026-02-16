-- ============================================================
-- Dashboard Layouts
-- ============================================================

create table public.dashboard_layouts (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  is_default boolean default false not null,
  layout jsonb default '[]' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.dashboard_layouts enable row level security;

create policy "Users can view own dashboard layouts"
  on public.dashboard_layouts for select
  using (
    user_id = auth.uid() or
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

create policy "Users can manage own dashboard layouts"
  on public.dashboard_layouts for all
  using (user_id = auth.uid());

-- ============================================================
-- Dashboard Widgets
-- ============================================================

create table public.dashboard_widgets (
  id uuid default uuid_generate_v4() primary key,
  layout_id uuid references public.dashboard_layouts on delete cascade not null,
  widget_type text not null check (widget_type in (
    'retention_waterfall', 'paywall_dropoff', 'hook_effectiveness',
    'cliffhanger_impact', 'trope_performance', 'series_health_score',
    'cross_platform_comparison', 'cohort_heatmap', 'experiment_status',
    'revenue_trend', 'engagement_trend', 'metric_card'
  )),
  title text not null,
  config jsonb default '{}' not null,
  position jsonb default '{"x": 0, "y": 0, "w": 6, "h": 4}' not null,
  created_at timestamptz default now() not null
);

alter table public.dashboard_widgets enable row level security;

create policy "Users can view dashboard widgets"
  on public.dashboard_widgets for select
  using (
    layout_id in (
      select id from public.dashboard_layouts
      where user_id = auth.uid() or
        workspace_id in (
          select workspace_id from public.workspace_members
          where user_id = auth.uid()
        )
    )
  );

create policy "Users can manage own dashboard widgets"
  on public.dashboard_widgets for all
  using (
    layout_id in (
      select id from public.dashboard_layouts
      where user_id = auth.uid()
    )
  );

-- Indexes
create index idx_dashboard_layouts_workspace on public.dashboard_layouts(workspace_id);
create index idx_dashboard_layouts_user on public.dashboard_layouts(user_id);
create index idx_dashboard_widgets_layout on public.dashboard_widgets(layout_id);
