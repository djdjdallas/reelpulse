/**
 * Email sending abstraction using Resend.
 */

let resendInstance = null;

async function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendInstance) {
    const { Resend } = await import("resend");
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

export async function sendEmail({ to, subject, html }) {
  const resend = await getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return null;
  }

  const from = process.env.NOTIFICATION_FROM_EMAIL || "noreply@reelytics.app";

  const { data, error } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    console.error("Email send error:", error);
    throw error;
  }
  return data;
}
