-- ============================================================
-- Fix self-referential RLS policies on workspace_members
-- ============================================================
-- Both the SELECT and ALL policies query workspace_members in their
-- own subqueries, causing PostgreSQL to detect infinite recursion
-- (error 42P17). Fix: use a SECURITY DEFINER function that bypasses
-- RLS to look up the user's workspace IDs, eliminating the cycle.

-- Helper: returns all workspace IDs the current user belongs to (bypasses RLS)
create or replace function public.get_user_workspace_ids()
returns setof uuid
language sql
security definer
stable
set search_path = ''
as $$
  select workspace_id
  from public.workspace_members
  where user_id = auth.uid();
$$;

-- Helper: returns workspace IDs where the current user is an owner (bypasses RLS)
create or replace function public.get_user_owned_workspace_ids()
returns setof uuid
language sql
security definer
stable
set search_path = ''
as $$
  select workspace_id
  from public.workspace_members
  where user_id = auth.uid() and role = 'owner';
$$;

-- Drop the broken policies
drop policy if exists "Members can view workspace members" on public.workspace_members;
drop policy if exists "Owners can manage workspace members" on public.workspace_members;

-- Recreate SELECT policy using the helper function (no self-reference)
create policy "Members can view workspace members"
  on public.workspace_members for select
  using (
    workspace_id in (select public.get_user_workspace_ids())
  );

-- Recreate ALL policy for owners using the helper function
-- Owners can insert/update/delete any member in workspaces they own
create policy "Owners can manage workspace members"
  on public.workspace_members for all
  using (
    workspace_id in (select public.get_user_owned_workspace_ids())
  );
