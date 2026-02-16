import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";
import { getTikTokAuthUrl } from "@/lib/integrations/tiktok";
import { getYouTubeAuthUrl } from "@/lib/integrations/youtube";

export async function GET(request, { params }) {
  try {
    const { platform } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get workspace
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id, role, workspaces(plan)")
      .eq("user_id", user.id)
      .single();

    if (!membership || membership.workspaces.plan === "free") {
      return NextResponse.json({ error: "Integrations require Pro or Studio plan" }, { status: 403 });
    }

    // Generate state token for CSRF protection
    const state = randomBytes(32).toString("hex");

    // Store state in a cookie for verification
    const response = NextResponse.json({ url: "" });
    response.cookies.set(`oauth_state_${platform}`, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });
    response.cookies.set(`oauth_workspace`, membership.workspace_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    let url;
    switch (platform) {
      case "tiktok":
        url = getTikTokAuthUrl(state);
        break;
      case "youtube":
        url = getYouTubeAuthUrl(state);
        break;
      default:
        return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
    }

    return NextResponse.json({ url }, {
      headers: response.headers,
    });
  } catch (err) {
    console.error("Authorization error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
