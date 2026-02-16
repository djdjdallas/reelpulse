/**
 * YouTube API client for OAuth and metrics fetching.
 * Uses YouTube Data API v3 and YouTube Analytics API.
 */

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DATA_API = "https://www.googleapis.com/youtube/v3";
const ANALYTICS_API = "https://youtubeanalytics.googleapis.com/v2";

export function getYouTubeAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.YOUTUBE_CLIENT_ID,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/integrations/youtube/callback`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `${AUTH_URL}?${params}`;
}

export async function exchangeYouTubeCode(code) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/integrations/youtube/callback`,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function refreshYouTubeToken(refreshToken) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

export async function getYouTubeChannelInfo(accessToken) {
  const res = await fetch(
    `${DATA_API}/channels?part=snippet&mine=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const channel = data.items?.[0];
  return channel
    ? { id: channel.id, title: channel.snippet.title, thumbnail: channel.snippet.thumbnails?.default?.url }
    : null;
}

export async function getYouTubeVideos(accessToken, channelId, pageToken = null) {
  const params = new URLSearchParams({
    part: "snippet,statistics,contentDetails",
    channelId,
    maxResults: "50",
    order: "date",
    type: "video",
  });
  if (pageToken) params.set("pageToken", pageToken);

  const res = await fetch(
    `${DATA_API}/search?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const searchData = await res.json();
  if (searchData.error) throw new Error(searchData.error.message);

  const videoIds = (searchData.items || []).map((i) => i.id.videoId).filter(Boolean);

  if (!videoIds.length) {
    return { videos: [], nextPageToken: null };
  }

  // Fetch full video details
  const detailRes = await fetch(
    `${DATA_API}/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(",")}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const detailData = await detailRes.json();

  return {
    videos: detailData.items || [],
    nextPageToken: searchData.nextPageToken || null,
  };
}

export async function getYouTubeVideoAnalytics(accessToken, videoId, startDate, endDate) {
  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics: "views,averageViewDuration,averageViewPercentage,likes,comments,estimatedRevenue",
    dimensions: "video",
    filters: `video==${videoId}`,
  });

  const res = await fetch(
    `${ANALYTICS_API}/reports?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const row = data.rows?.[0];
  if (!row) return null;

  return {
    views: row[1] || 0,
    averageViewDuration: row[2] || 0,
    averageViewPercentage: row[3] || 0,
    likes: row[4] || 0,
    comments: row[5] || 0,
    estimatedRevenue: row[6] || 0,
  };
}

/**
 * Map YouTube video metrics to episode_metrics format.
 */
export function mapYouTubeMetrics(stats, analytics = null) {
  return {
    views: parseInt(stats.viewCount || "0", 10),
    likes: parseInt(stats.likeCount || "0", 10),
    comments: parseInt(stats.commentCount || "0", 10),
    avg_percent_watched: analytics?.averageViewPercentage || 0,
    watch_time_seconds: analytics?.averageViewDuration || 0,
    revenue_cents: Math.round((analytics?.estimatedRevenue || 0) * 100),
  };
}
