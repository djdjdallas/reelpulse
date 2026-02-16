-- Add Stripe billing columns to workspaces (if not already present)
alter table public.workspaces
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;
