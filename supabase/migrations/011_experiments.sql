-- ============================================================
-- Experiments (A/B Testing)
-- ============================================================

create table public.experiments (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  series_id uuid references public.series on delete cascade,
  name text not null,
  type text not null check (type in ('paywall_position', 'hook_style', 'thumbnail', 'episode_order', 'custom')),
  status text default 'draft' not null check (status in ('draft', 'running', 'paused', 'completed')),
  hypothesis text,
  success_metric text default 'retention' check (success_metric in ('retention', 'conversion', 'views', 'revenue', 'engagement')),
  start_date date,
  end_date date,
  created_by uuid references public.profiles on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.experiments enable row level security;

create policy "Members can view experiments"
  on public.experiments for select
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

create policy "Editors can manage experiments"
  on public.experiments for all
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role in ('owner', 'editor')
    )
  );

-- ============================================================
-- Experiment Variants
-- ============================================================

create table public.experiment_variants (
  id uuid default uuid_generate_v4() primary key,
  experiment_id uuid references public.experiments on delete cascade not null,
  name text not null,
  description text,
  is_control boolean default false not null,
  traffic_allocation numeric(5,2) default 50.00,
  config jsonb default '{}',
  created_at timestamptz default now() not null
);

alter table public.experiment_variants enable row level security;

create policy "Members can view experiment variants"
  on public.experiment_variants for select
  using (
    experiment_id in (
      select id from public.experiments
      where workspace_id in (
        select workspace_id from public.workspace_members
        where user_id = auth.uid()
      )
    )
  );

create policy "Editors can manage experiment variants"
  on public.experiment_variants for all
  using (
    experiment_id in (
      select id from public.experiments
      where workspace_id in (
        select workspace_id from public.workspace_members
        where user_id = auth.uid() and role in ('owner', 'editor')
      )
    )
  );

-- ============================================================
-- Experiment Metrics (per variant per date)
-- ============================================================

create table public.experiment_metrics (
  id uuid default uuid_generate_v4() primary key,
  variant_id uuid references public.experiment_variants on delete cascade not null,
  date date not null,
  sample_size integer default 0,
  views integer default 0,
  avg_retention numeric(5,2) default 0,
  unlocks integer default 0,
  revenue_cents integer default 0,
  engagement_score numeric(5,2) default 0,
  created_at timestamptz default now() not null,
  unique(variant_id, date)
);

alter table public.experiment_metrics enable row level security;

create policy "Members can view experiment metrics"
  on public.experiment_metrics for select
  using (
    variant_id in (
      select id from public.experiment_variants
      where experiment_id in (
        select id from public.experiments
        where workspace_id in (
          select workspace_id from public.workspace_members
          where user_id = auth.uid()
        )
      )
    )
  );

create policy "Editors can manage experiment metrics"
  on public.experiment_metrics for all
  using (
    variant_id in (
      select id from public.experiment_variants
      where experiment_id in (
        select id from public.experiments
        where workspace_id in (
          select workspace_id from public.workspace_members
          where user_id = auth.uid() and role in ('owner', 'editor')
        )
      )
    )
  );

-- Indexes
create index idx_experiments_workspace on public.experiments(workspace_id);
create index idx_experiments_series on public.experiments(series_id);
create index idx_experiment_variants_experiment on public.experiment_variants(experiment_id);
create index idx_experiment_metrics_variant on public.experiment_metrics(variant_id);
