/**
 * TikTok API client for OAuth and metrics fetching.
 * Uses TikTok API v2: https://developers.tiktok.com/doc/
 */

const BASE_URL = "https://open.tiktokapis.com/v2";

export function getTikTokAuthUrl(state) {
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY,
    scope: "user.info.basic,video.list",
    response_type: "code",
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/integrations/tiktok/callback`,
    state,
  });

  return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
}

export async function exchangeTikTokCode(code) {
  const res = await fetch(`${BASE_URL}/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/integrations/tiktok/callback`,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    openId: data.open_id,
  };
}

export async function refreshTikTokToken(refreshToken) {
  const res = await fetch(`${BASE_URL}/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
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

export async function getTikTokUserInfo(accessToken) {
  const res = await fetch(`${BASE_URL}/user/info/?fields=open_id,display_name,avatar_url`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await res.json();
  if (data.error?.code) throw new Error(data.error.message);

  return data.data?.user;
}

export async function getTikTokVideos(accessToken, cursor = null) {
  const body = { max_count: 20 };
  if (cursor) body.cursor = cursor;

  const res = await fetch(`${BASE_URL}/video/list/?fields=id,title,create_time,view_count,like_count,comment_count,share_count,duration`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (data.error?.code) throw new Error(data.error.message);

  return {
    videos: data.data?.videos || [],
    cursor: data.data?.cursor,
    hasMore: data.data?.has_more || false,
  };
}

/**
 * Map TikTok video metrics to episode_metrics format.
 */
export function mapTikTokMetrics(video) {
  return {
    views: video.view_count || 0,
    likes: video.like_count || 0,
    comments: video.comment_count || 0,
    shares: video.share_count || 0,
  };
}
