/**
 * HTML email templates for different alert types.
 */

const baseWrapper = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f4f4f5;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7;">
    <div style="padding:24px 32px;border-bottom:1px solid #e4e4e7;">
      <h1 style="margin:0;font-size:18px;color:#6366f1;">Reelytics</h1>
    </div>
    <div style="padding:32px;">
      ${content}
    </div>
    <div style="padding:16px 32px;background:#fafafa;text-align:center;font-size:12px;color:#71717a;">
      You're receiving this because you have alerts enabled. <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/settings" style="color:#6366f1;">Manage preferences</a>
    </div>
  </div>
</body>
</html>`;

export function retentionDropEmail({ seriesTitle, previous, current, drop }) {
  return {
    subject: `Alert: Retention dropped ${drop.toFixed(1)}% on "${seriesTitle}"`,
    html: baseWrapper(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#18181b;">Retention Drop Detected</h2>
      <p style="color:#52525b;line-height:1.6;">Average retention for <strong>${seriesTitle}</strong> dropped by <strong style="color:#ef4444;">${drop.toFixed(1)}%</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 0;color:#71717a;">Previous</td><td style="padding:8px 0;text-align:right;font-weight:600;">${previous.toFixed(1)}%</td></tr>
        <tr><td style="padding:8px 0;color:#71717a;">Current</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#ef4444;">${current.toFixed(1)}%</td></tr>
      </table>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;">View Dashboard</a>
    `),
  };
}

export function healthScoreDipEmail({ seriesTitle, previous, current, dip }) {
  return {
    subject: `Alert: Health score declined ${dip.toFixed(1)} pts on "${seriesTitle}"`,
    html: baseWrapper(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#18181b;">Health Score Declined</h2>
      <p style="color:#52525b;line-height:1.6;">The health score for <strong>${seriesTitle}</strong> dropped by <strong style="color:#f59e0b;">${dip.toFixed(1)}</strong> points.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 0;color:#71717a;">Previous</td><td style="padding:8px 0;text-align:right;font-weight:600;">${previous.toFixed(1)}</td></tr>
        <tr><td style="padding:8px 0;color:#71717a;">Current</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#f59e0b;">${current.toFixed(1)}</td></tr>
      </table>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;">View Dashboard</a>
    `),
  };
}

export function paywallConversionEmail({ seriesTitle, previous, current, drop }) {
  return {
    subject: `Alert: Paywall conversion dropped ${drop.toFixed(1)}% on "${seriesTitle}"`,
    html: baseWrapper(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#18181b;">Paywall Conversion Decline</h2>
      <p style="color:#52525b;line-height:1.6;">Paywall conversion for <strong>${seriesTitle}</strong> dropped by <strong style="color:#ef4444;">${drop.toFixed(1)}%</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 0;color:#71717a;">Previous</td><td style="padding:8px 0;text-align:right;font-weight:600;">${previous.toFixed(1)}%</td></tr>
        <tr><td style="padding:8px 0;color:#71717a;">Current</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#ef4444;">${current.toFixed(1)}%</td></tr>
      </table>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;">View Dashboard</a>
    `),
  };
}

export function syncCompleteEmail({ platform, recordsSynced }) {
  return {
    subject: `${platform} sync complete — ${recordsSynced} records updated`,
    html: baseWrapper(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#18181b;">Sync Complete</h2>
      <p style="color:#52525b;line-height:1.6;">Your <strong>${platform}</strong> metrics sync finished successfully. <strong>${recordsSynced}</strong> records were updated.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/integrations" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;">View Integrations</a>
    `),
  };
}

export function syncErrorEmail({ platform, errorMessage }) {
  return {
    subject: `${platform} sync failed`,
    html: baseWrapper(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#18181b;">Sync Failed</h2>
      <p style="color:#52525b;line-height:1.6;">Your <strong>${platform}</strong> metrics sync encountered an error:</p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:4px;padding:12px;color:#991b1b;font-size:14px;margin:16px 0;">${errorMessage}</div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/integrations" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;">Check Integration</a>
    `),
  };
}

export function getEmailTemplate(type, data) {
  switch (type) {
    case "retention_drop": return retentionDropEmail(data);
    case "health_score_dip": return healthScoreDipEmail(data);
    case "paywall_conversion": return paywallConversionEmail(data);
    case "sync_complete": return syncCompleteEmail(data);
    case "sync_error": return syncErrorEmail(data);
    default: return null;
  }
}
