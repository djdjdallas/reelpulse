alter table public.profiles
  add column has_completed_onboarding boolean default false not null;

-- Grandfather existing users so they skip onboarding
update public.profiles set has_completed_onboarding = true;
