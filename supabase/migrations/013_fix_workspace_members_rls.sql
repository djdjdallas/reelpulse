-- ============================================================
-- Fix self-referential RLS policies on workspace_members
-- ============================================================
-- The SELECT and ALL policies both query workspace_members in their
-- own subqueries, causing PostgreSQL/PostgREST to return 500 errors
-- (infinite recursion). Fix: add a direct `user_id = auth.uid()`
-- check to the SELECT policy so the user's own rows are always
-- readable, breaking the recursion.

-- Drop the broken policies
drop policy if exists "Members can view workspace members" on public.workspace_members;
drop policy if exists "Owners can manage workspace members" on public.workspace_members;

-- Recreate SELECT policy with direct user check to break recursion
create policy "Members can view workspace members"
  on public.workspace_members for select
  using (
    user_id = auth.uid()
    or workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

-- Recreate ALL policy for owners (works now that SELECT is fixed)
create policy "Owners can manage workspace members"
  on public.workspace_members for all
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role = 'owner'
    )
  );
