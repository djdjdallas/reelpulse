export function GET() {
  const content = `# Reelytics

> Analytics platform for micro-drama series creators

Reelytics helps creators and studios track performance across short-form drama platforms. Monitor views, engagement, revenue, and audience retention for episodic series published on platforms like ReelShort, DramaBox, ShortTV, TikTok, and YouTube Shorts.

## Target Audience

- Micro-drama series creators
- Short-form content studios
- Producers managing episodic series across multiple platforms

## Supported Platforms

- ReelShort
- DramaBox
- ShortTV
- TikTok
- YouTube Shorts

## Key Features

### Analytics & Tracking
- Cross-platform performance dashboards
- Episode-level and series-level metrics
- Views, engagement, and revenue tracking
- Audience retention analysis

### Series Management
- Organize content by series and episodes
- Track performance across platforms from one place
- Compare series performance side-by-side

### Audience Insights
- Cohort analysis
- Audience segmentation
- Custom segments for targeted analysis

### Experimentation
- A/B testing for thumbnails, titles, and release strategies
- Experiment tracking and results analysis

### Collaboration & Workflow
- Team workspaces with role-based access
- Custom alerts and scheduled reports
- Platform integrations for automated data sync

## Pricing

- Free: Basic analytics for up to 3 series
- Pro ($49/mo): Full analytics, unlimited series, team collaboration
- Studio ($199/mo): Advanced features, priority support, custom integrations

## Links

- Website: https://reelytics.io
- Login: https://reelytics.io/login
- Sign Up: https://reelytics.io/signup
- Pricing: https://reelytics.io/pricing

## Notes

- The dashboard and API routes are authenticated and not publicly accessible.
- There is no public API available at this time.
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
