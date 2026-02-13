/**
 * Sample data: "The Billionaire's Secret Wife"
 *
 * 20 episodes on ReelShort, CEO/Billionaire genre
 * Pattern: Eps 1-3 high views/retention, 4-7 gradual decline,
 *          Ep 8 paywall drop, 9-15 steady paid, 16-20 finale spike
 */

export const SAMPLE_SERIES = {
  title: "The Billionaire's Secret Wife",
  genre: "CEO/Billionaire",
  platform: "ReelShort",
  total_episodes: 20,
  paywall_episode: 8,
  description:
    "When struggling waitress Emma discovers her one-night stand is actually billionaire CEO Alexander Chen, she thinks she'll never see him again. But a contract marriage changes everything — and secrets from both their pasts threaten to destroy it all.",
  target_audience: "Women 18-35, romance/drama fans",
  status: "active",
};

export const SAMPLE_EPISODES = [
  { episode_number: 1, title: "The Encounter", duration_seconds: 92, is_free: true, hook_timestamp_seconds: 3, cliffhanger_timestamp_seconds: 88, trope_tags: ["Secret Identity", "Rags to Riches"] },
  { episode_number: 2, title: "Morning After", duration_seconds: 88, is_free: true, hook_timestamp_seconds: 5, cliffhanger_timestamp_seconds: 85, trope_tags: ["Secret Identity", "Mistaken Identity"] },
  { episode_number: 3, title: "The Proposal", duration_seconds: 95, is_free: true, hook_timestamp_seconds: 4, cliffhanger_timestamp_seconds: 91, trope_tags: ["Contract Marriage", "Plot Twist"] },
  { episode_number: 4, title: "Moving In", duration_seconds: 90, is_free: true, hook_timestamp_seconds: 6, cliffhanger_timestamp_seconds: 86, trope_tags: ["Fake Relationship", "Slow Burn"] },
  { episode_number: 5, title: "The Gala", duration_seconds: 94, is_free: true, hook_timestamp_seconds: 4, cliffhanger_timestamp_seconds: 90, trope_tags: ["Jealousy Arc", "Love Triangle"] },
  { episode_number: 6, title: "Cracks Appear", duration_seconds: 87, is_free: true, hook_timestamp_seconds: 7, cliffhanger_timestamp_seconds: 83, trope_tags: ["Betrayal", "Family Secrets"] },
  { episode_number: 7, title: "The Truth Begins", duration_seconds: 91, is_free: true, hook_timestamp_seconds: 5, cliffhanger_timestamp_seconds: 88, trope_tags: ["Cliffhanger Reveal", "Power Struggle"] },
  { episode_number: 8, title: "Shattered Trust", duration_seconds: 96, is_free: false, hook_timestamp_seconds: 3, cliffhanger_timestamp_seconds: 93, trope_tags: ["Betrayal", "Plot Twist"] },
  { episode_number: 9, title: "The Fallout", duration_seconds: 89, is_free: false, hook_timestamp_seconds: 4, cliffhanger_timestamp_seconds: 85, trope_tags: ["Revenge Arc", "Power Struggle"] },
  { episode_number: 10, title: "Hidden Allies", duration_seconds: 93, is_free: false, hook_timestamp_seconds: 5, cliffhanger_timestamp_seconds: 89, trope_tags: ["Hidden Heir", "Double Life"] },
  { episode_number: 11, title: "The Board Meeting", duration_seconds: 88, is_free: false, hook_timestamp_seconds: 6, cliffhanger_timestamp_seconds: 84, trope_tags: ["Power Struggle", "Underdog Rise"] },
  { episode_number: 12, title: "Memories", duration_seconds: 85, is_free: false, hook_timestamp_seconds: 4, cliffhanger_timestamp_seconds: 82, trope_tags: ["Flashback", "Family Secrets"] },
  { episode_number: 13, title: "The Confrontation", duration_seconds: 97, is_free: false, hook_timestamp_seconds: 3, cliffhanger_timestamp_seconds: 94, trope_tags: ["Revenge Arc", "Cliffhanger Reveal"] },
  { episode_number: 14, title: "Turning Point", duration_seconds: 90, is_free: false, hook_timestamp_seconds: 5, cliffhanger_timestamp_seconds: 87, trope_tags: ["Second Chance", "Sacrifice"] },
  { episode_number: 15, title: "Unlikely Alliance", duration_seconds: 92, is_free: false, hook_timestamp_seconds: 4, cliffhanger_timestamp_seconds: 89, trope_tags: ["Enemies to Lovers", "Slow Burn"] },
  { episode_number: 16, title: "The Reveal", duration_seconds: 98, is_free: false, hook_timestamp_seconds: 2, cliffhanger_timestamp_seconds: 95, trope_tags: ["Plot Twist", "Hidden Heir"] },
  { episode_number: 17, title: "War Declared", duration_seconds: 94, is_free: false, hook_timestamp_seconds: 3, cliffhanger_timestamp_seconds: 91, trope_tags: ["Revenge Arc", "Power Struggle"] },
  { episode_number: 18, title: "Last Stand", duration_seconds: 96, is_free: false, hook_timestamp_seconds: 2, cliffhanger_timestamp_seconds: 93, trope_tags: ["Sacrifice", "Underdog Rise"] },
  { episode_number: 19, title: "The Reckoning", duration_seconds: 100, is_free: false, hook_timestamp_seconds: 3, cliffhanger_timestamp_seconds: 97, trope_tags: ["Reunion", "Cliffhanger Reveal"] },
  { episode_number: 20, title: "Forever After", duration_seconds: 105, is_free: false, hook_timestamp_seconds: 4, cliffhanger_timestamp_seconds: null, trope_tags: ["Second Chance", "Reunion"] },
];

/**
 * Metrics pattern:
 * Eps 1-3: High views (50k-45k), high retention (85-88%)
 * Eps 4-7: Gradual decline (40k-28k views, 75-68% retention)
 * Ep 8: Paywall drop (12k views, 72% retention - only paying users)
 * Eps 9-15: Steady paid (10k-11k views, 74-78% retention)
 * Eps 16-20: Finale spike (13k-18k views, 82-92% retention)
 */
export const SAMPLE_METRICS = [
  { episode_number: 1, date: "2025-01-15", views: 52000, watch_time_seconds: 78, avg_percent_watched: 88.2, drop_off_point_seconds: 75, likes: 3100, shares: 920, comments: 410, unlocks: 0, revenue_cents: 0 },
  { episode_number: 2, date: "2025-01-15", views: 47500, watch_time_seconds: 74, avg_percent_watched: 86.5, drop_off_point_seconds: 70, likes: 2800, shares: 850, comments: 380, unlocks: 0, revenue_cents: 0 },
  { episode_number: 3, date: "2025-01-15", views: 44000, watch_time_seconds: 81, avg_percent_watched: 87.1, drop_off_point_seconds: 78, likes: 2900, shares: 810, comments: 420, unlocks: 0, revenue_cents: 0 },
  { episode_number: 4, date: "2025-01-15", views: 38000, watch_time_seconds: 68, avg_percent_watched: 78.4, drop_off_point_seconds: 62, likes: 2100, shares: 600, comments: 290, unlocks: 0, revenue_cents: 0 },
  { episode_number: 5, date: "2025-01-15", views: 34500, watch_time_seconds: 70, avg_percent_watched: 75.2, drop_off_point_seconds: 65, likes: 1900, shares: 540, comments: 260, unlocks: 0, revenue_cents: 0 },
  { episode_number: 6, date: "2025-01-15", views: 31000, watch_time_seconds: 61, avg_percent_watched: 71.8, drop_off_point_seconds: 58, likes: 1600, shares: 430, comments: 210, unlocks: 0, revenue_cents: 0 },
  { episode_number: 7, date: "2025-01-15", views: 28000, watch_time_seconds: 62, avg_percent_watched: 68.5, drop_off_point_seconds: 57, likes: 1500, shares: 400, comments: 195, unlocks: 0, revenue_cents: 0 },
  { episode_number: 8, date: "2025-01-15", views: 12000, watch_time_seconds: 69, avg_percent_watched: 72.3, drop_off_point_seconds: 64, likes: 980, shares: 310, comments: 185, unlocks: 12000, revenue_cents: 1188000 },
  { episode_number: 9, date: "2025-01-15", views: 10800, watch_time_seconds: 66, avg_percent_watched: 74.1, drop_off_point_seconds: 60, likes: 890, shares: 280, comments: 160, unlocks: 800, revenue_cents: 79200 },
  { episode_number: 10, date: "2025-01-15", views: 10500, watch_time_seconds: 70, avg_percent_watched: 76.8, drop_off_point_seconds: 65, likes: 870, shares: 260, comments: 155, unlocks: 500, revenue_cents: 49500 },
  { episode_number: 11, date: "2025-01-15", views: 10200, watch_time_seconds: 66, avg_percent_watched: 75.5, drop_off_point_seconds: 60, likes: 840, shares: 240, comments: 140, unlocks: 350, revenue_cents: 34650 },
  { episode_number: 12, date: "2025-01-15", views: 10000, watch_time_seconds: 64, avg_percent_watched: 74.2, drop_off_point_seconds: 58, likes: 820, shares: 230, comments: 135, unlocks: 280, revenue_cents: 27720 },
  { episode_number: 13, date: "2025-01-15", views: 10400, watch_time_seconds: 74, avg_percent_watched: 77.9, drop_off_point_seconds: 70, likes: 900, shares: 290, comments: 170, unlocks: 400, revenue_cents: 39600 },
  { episode_number: 14, date: "2025-01-15", views: 10600, watch_time_seconds: 68, avg_percent_watched: 76.4, drop_off_point_seconds: 63, likes: 880, shares: 270, comments: 150, unlocks: 350, revenue_cents: 34650 },
  { episode_number: 15, date: "2025-01-15", views: 11000, watch_time_seconds: 71, avg_percent_watched: 78.2, drop_off_point_seconds: 67, likes: 920, shares: 300, comments: 165, unlocks: 500, revenue_cents: 49500 },
  { episode_number: 16, date: "2025-01-15", views: 13500, watch_time_seconds: 80, avg_percent_watched: 82.6, drop_off_point_seconds: 78, likes: 1200, shares: 420, comments: 230, unlocks: 2500, revenue_cents: 247500 },
  { episode_number: 17, date: "2025-01-15", views: 14800, watch_time_seconds: 82, avg_percent_watched: 85.3, drop_off_point_seconds: 80, likes: 1350, shares: 480, comments: 260, unlocks: 1300, revenue_cents: 128700 },
  { episode_number: 18, date: "2025-01-15", views: 16200, watch_time_seconds: 86, avg_percent_watched: 88.7, drop_off_point_seconds: 84, likes: 1500, shares: 540, comments: 310, unlocks: 1400, revenue_cents: 138600 },
  { episode_number: 19, date: "2025-01-15", views: 17500, watch_time_seconds: 92, avg_percent_watched: 91.2, drop_off_point_seconds: 90, likes: 1700, shares: 620, comments: 380, unlocks: 1300, revenue_cents: 128700 },
  { episode_number: 20, date: "2025-01-15", views: 18000, watch_time_seconds: 98, avg_percent_watched: 93.5, drop_off_point_seconds: 100, likes: 1900, shares: 700, comments: 450, unlocks: 500, revenue_cents: 49500 },
];
