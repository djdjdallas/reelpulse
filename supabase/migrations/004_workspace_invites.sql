-- ============================================================
-- Workspace Invites (Team Collaboration)
-- ============================================================

create table public.workspace_invites (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  email text not null,
  role text default 'viewer' not null check (role in ('editor', 'viewer')),
  token text not null unique,
  status text default 'pending' not null check (status in ('pending', 'accepted', 'revoked', 'expired')),
  invited_by uuid references public.profiles on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.workspace_invites enable row level security;

-- Members can view invites for their workspace
create policy "Members can view workspace invites"
  on public.workspace_invites for select
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

-- Owners can create invites
create policy "Owners can create workspace invites"
  on public.workspace_invites for insert
  with check (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- Owners can update invites (revoke)
create policy "Owners can update workspace invites"
  on public.workspace_invites for update
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- Owners can delete invites
create policy "Owners can delete workspace invites"
  on public.workspace_invites for delete
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- Indexes
create index idx_workspace_invites_workspace on public.workspace_invites(workspace_id);
create index idx_workspace_invites_token on public.workspace_invites(token);
create index idx_workspace_invites_email on public.workspace_invites(email);
