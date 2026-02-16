-- ============================================================
-- Platform Links (link series to platform identifiers)
-- ============================================================

create table public.platform_links (
  id uuid default uuid_generate_v4() primary key,
  series_id uuid references public.series on delete cascade not null,
  platform text not null check (platform in ('tiktok', 'youtube', 'reelshort', 'other')),
  platform_series_id text,
  platform_url text,
  title_on_platform text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(series_id, platform)
);

alter table public.platform_links enable row level security;

create policy "Members can view platform links"
  on public.platform_links for select
  using (
    series_id in (
      select id from public.series
      where workspace_id in (
        select workspace_id from public.workspace_members
        where user_id = auth.uid()
      )
    )
  );

create policy "Editors can manage platform links"
  on public.platform_links for all
  using (
    series_id in (
      select id from public.series
      where workspace_id in (
        select workspace_id from public.workspace_members
        where user_id = auth.uid() and role in ('owner', 'editor')
      )
    )
  );

-- Cross-platform metrics view
create or replace view public.cross_platform_metrics as
select
  pl.series_id,
  pl.platform,
  pl.title_on_platform,
  count(distinct e.id) as episode_count,
  coalesce(sum(em.views), 0)::bigint as total_views,
  coalesce(avg(em.avg_percent_watched), 0)::numeric as avg_retention,
  coalesce(sum(em.likes), 0)::bigint as total_likes,
  coalesce(sum(em.shares), 0)::bigint as total_shares,
  coalesce(sum(em.comments), 0)::bigint as total_comments,
  coalesce(sum(em.revenue_cents), 0)::bigint as total_revenue_cents
from public.platform_links pl
join public.episodes e on e.series_id = pl.series_id
left join public.episode_metrics em on em.episode_id = e.id
group by pl.series_id, pl.platform, pl.title_on_platform;

-- Indexes
create index idx_platform_links_series on public.platform_links(series_id);
