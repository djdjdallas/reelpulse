-- ============================================================
-- Report Templates
-- ============================================================

create table public.report_templates (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  name text not null,
  type text not null check (type in ('weekly_series', 'monthly_portfolio', 'post_series_retrospective', 'custom')),
  config jsonb default '{}' not null,
  created_by uuid references public.profiles on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.report_templates enable row level security;

create policy "Members can view report templates"
  on public.report_templates for select
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

create policy "Editors can insert report templates"
  on public.report_templates for insert
  with check (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role in ('owner', 'editor')
    )
  );

create policy "Editors can update report templates"
  on public.report_templates for update
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role in ('owner', 'editor')
    )
  );

create policy "Owners can delete report templates"
  on public.report_templates for delete
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- ============================================================
-- Generated Reports
-- ============================================================

create table public.generated_reports (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  template_id uuid references public.report_templates on delete set null,
  name text not null,
  format text not null check (format in ('csv', 'pdf')),
  storage_path text,
  config jsonb default '{}',
  generated_by uuid references public.profiles on delete set null,
  created_at timestamptz default now() not null
);

alter table public.generated_reports enable row level security;

create policy "Members can view generated reports"
  on public.generated_reports for select
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

create policy "Editors can insert generated reports"
  on public.generated_reports for insert
  with check (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role in ('owner', 'editor')
    )
  );

-- Indexes
create index idx_report_templates_workspace on public.report_templates(workspace_id);
create index idx_generated_reports_workspace on public.generated_reports(workspace_id);
