import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { encrypt } from "@/lib/integrations/tokenEncryption";
import { exchangeTikTokCode, getTikTokUserInfo } from "@/lib/integrations/tiktok";
import { exchangeYouTubeCode, getYouTubeChannelInfo } from "@/lib/integrations/youtube";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function GET(request, { params }) {
  const { platform } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=${encodeURIComponent(error)}`);
  }

  try {
    const cookieStore = await cookies();
    const storedState = cookieStore.get(`oauth_state_${platform}`)?.value;
    const workspaceId = cookieStore.get("oauth_workspace")?.value;

    if (!state || state !== storedState) {
      return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=invalid_state`);
    }

    if (!workspaceId) {
      return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=missing_workspace`);
    }

    let tokens, platformUserId, platformUsername;

    switch (platform) {
      case "tiktok": {
        const result = await exchangeTikTokCode(code);
        tokens = result;
        const userInfo = await getTikTokUserInfo(result.accessToken);
        platformUserId = result.openId;
        platformUsername = userInfo?.display_name || result.openId;
        break;
      }
      case "youtube": {
        const result = await exchangeYouTubeCode(code);
        tokens = result;
        const channelInfo = await getYouTubeChannelInfo(result.accessToken);
        platformUserId = channelInfo?.id;
        platformUsername = channelInfo?.title || "YouTube Channel";
        break;
      }
      default:
        return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=unsupported_platform`);
    }

    const supabase = getServiceClient();

    // Upsert platform connection
    const { error: dbError } = await supabase
      .from("platform_connections")
      .upsert(
        {
          workspace_id: workspaceId,
          platform,
          platform_user_id: platformUserId,
          platform_username: platformUsername,
          access_token_encrypted: encrypt(tokens.accessToken),
          refresh_token_encrypted: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
          token_expires_at: tokens.expiresIn
            ? new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
            : null,
          status: "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "workspace_id,platform" }
      );

    if (dbError) throw dbError;

    // Clear state cookies
    const response = NextResponse.redirect(`${appUrl}/dashboard/integrations?connected=${platform}`);
    response.cookies.delete(`oauth_state_${platform}`);
    response.cookies.delete("oauth_workspace");
    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      `${appUrl}/dashboard/integrations?error=${encodeURIComponent(err.message)}`
    );
  }
}
