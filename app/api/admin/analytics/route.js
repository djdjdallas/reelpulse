import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  analyticsLimiter,
  rateLimitHeaders,
} from "@/lib/utils/rateLimit";

const POSTHOG_HOST = "https://us.i.posthog.com";
const POSTHOG_PROJECT_ID = "314104";

const ADMIN_EMAIL = "dominickjerell@gmail.com";
const VALID_PERIODS = new Set([1, 3, 7, 30]);

async function runHogQL(query, apiKey) {
  const res = await fetch(
    `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PostHog query failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.results ?? [];
}

function parseDomain(url) {
  if (!url || url === "$direct" || url === "") return "(direct)";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin email
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Rate limit
    const rateLimit = analyticsLimiter.check(user.id);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: rateLimitHeaders(10, rateLimit.remaining, rateLimit.resetAt),
        }
      );
    }

    const body = await request.json();
    const period = Number(body.period);

    if (!VALID_PERIODS.has(period)) {
      return NextResponse.json(
        { error: "Invalid period. Use 1, 3, 7, or 30." },
        { status: 400 }
      );
    }

    const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "PostHog API key not configured" },
        { status: 500 }
      );
    }

    // Run 4 queries in parallel
    const [dauRows, wauRows, eventRows, referrerRows] = await Promise.all([
      // DAU: unique users per day
      runHogQL(
        `SELECT toDate(timestamp) AS day, count(DISTINCT distinct_id) AS unique_users
         FROM events
         WHERE timestamp >= now() - interval ${period} day
         GROUP BY day
         ORDER BY day`,
        apiKey
      ),
      // WAU: unique users in last 7 days (rolling)
      runHogQL(
        `SELECT count(DISTINCT distinct_id) AS wau
         FROM events
         WHERE timestamp >= now() - interval 7 day`,
        apiKey
      ),
      // Events: count by event name
      runHogQL(
        `SELECT event, count() AS cnt
         FROM events
         WHERE timestamp >= now() - interval ${period} day
         GROUP BY event
         ORDER BY cnt DESC`,
        apiKey
      ),
      // Referrers: top referring domains
      runHogQL(
        `SELECT properties.$referrer AS referrer, count() AS cnt
         FROM events
         WHERE timestamp >= now() - interval ${period} day
           AND properties.$referrer IS NOT NULL
           AND properties.$referrer != ''
         GROUP BY referrer
         ORDER BY cnt DESC
         LIMIT 50`,
        apiKey
      ),
    ]);

    // Format DAU
    const dau = dauRows.map(([day, unique_users]) => ({
      day,
      unique_users: Number(unique_users),
    }));

    // Format WAU
    const wau = wauRows.length > 0 ? Number(wauRows[0][0]) : 0;

    // Format events
    const events = eventRows.map(([event, count]) => ({
      event,
      count: Number(count),
    }));

    // Format referrers - aggregate by domain
    const domainMap = new Map();
    for (const [url, count] of referrerRows) {
      const domain = parseDomain(url);
      domainMap.set(domain, (domainMap.get(domain) || 0) + Number(count));
    }
    const referrers = Array.from(domainMap.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return NextResponse.json(
      { dau, wau, events, referrers },
      {
        headers: rateLimitHeaders(10, rateLimit.remaining, rateLimit.resetAt),
      }
    );
  } catch (err) {
    console.error("Admin analytics error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
