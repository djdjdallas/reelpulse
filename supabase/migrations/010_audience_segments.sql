-- ============================================================
-- Audience Segments
-- ============================================================

create table public.audience_segments (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  name text not null,
  type text not null check (type in ('binger', 'casual', 'free_viewer', 'converted', 'churned', 'platform_origin', 'custom')),
  rules jsonb default '{}' not null,
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.audience_segments enable row level security;

create policy "Members can view audience segments"
  on public.audience_segments for select
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

create policy "Editors can manage audience segments"
  on public.audience_segments for all
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role in ('owner', 'editor')
    )
  );

-- ============================================================
-- Segment Analysis Results
-- ============================================================

create table public.segment_analysis (
  id uuid default uuid_generate_v4() primary key,
  segment_id uuid references public.audience_segments on delete cascade not null,
  series_id uuid references public.series on delete cascade,
  estimated_size integer default 0,
  avg_retention numeric(5,2),
  conversion_rate numeric(5,2),
  avg_views_per_episode numeric(10,2),
  avg_revenue_per_episode numeric(10,2),
  journey_data jsonb default '{}',
  analyzed_at timestamptz default now() not null,
  unique(segment_id, series_id)
);

alter table public.segment_analysis enable row level security;

create policy "Members can view segment analysis"
  on public.segment_analysis for select
  using (
    segment_id in (
      select id from public.audience_segments
      where workspace_id in (
        select workspace_id from public.workspace_members
        where user_id = auth.uid()
      )
    )
  );

create policy "Editors can manage segment analysis"
  on public.segment_analysis for all
  using (
    segment_id in (
      select id from public.audience_segments
      where workspace_id in (
        select workspace_id from public.workspace_members
        where user_id = auth.uid() and role in ('owner', 'editor')
      )
    )
  );

-- Indexes
create index idx_audience_segments_workspace on public.audience_segments(workspace_id);
create index idx_segment_analysis_segment on public.segment_analysis(segment_id);
create index idx_segment_analysis_series on public.segment_analysis(series_id);
