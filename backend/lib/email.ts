import { Resend } from "resend";
import { HTTPException } from "hono/http-exception";
import { OTP_EXPIRATION_MINUTES, INVITE_EXPIRATION_DAYS, IS_DEV } from "lib/config.js";

const QUOTA_NOTIFY_BUCKETS = [0.5, 0.7, 0.8, 0.9, 0.95, 1.0];
const RESEND_DAILY_LIMIT = 100;
const RESEND_MONTHLY_LIMIT = 3000;

const resend = new Resend(process.env.RESEND_API_KEY);

type Props = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

const sendNtfyNotification = async (title: string, message: string) => {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;
  try {
    await fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers: { Title: title },
      body: message,
    });
  } catch (err) {
    console.error(`[ntfy] failed to send notification: ${err instanceof Error ? err.message : err}`);
  }
};

const notifyQuotaUsage = async (label: string, used: number, limit: number) => {
  if (!Number.isFinite(used)) return;

  const usedBefore = used - 1;
  const crossed = QUOTA_NOTIFY_BUCKETS.find((bucket) => {
    const threshold = Math.ceil(limit * bucket);
    return usedBefore < threshold && used >= threshold;
  });
  if (crossed === undefined) return;

  await sendNtfyNotification(
    "⚠️ BirdPlan email quota",
    `${label} email quota crossed ${Math.round(crossed * 100)}% — ${used}/${limit} sent.`,
  );
};

const notifyQuotas = async (headers: Record<string, string> | null) => {
  await notifyQuotaUsage("Daily", Number(headers?.["x-resend-daily-quota"]), RESEND_DAILY_LIMIT);
  await notifyQuotaUsage("Monthly", Number(headers?.["x-resend-monthly-quota"]), RESEND_MONTHLY_LIMIT);
};

export const sendEmail = async ({ to, subject, html, replyTo }: Props) => {
  if (IS_DEV) {
    console.log(`\n📧 [dev] email not sent\n  to: ${to}\n  subject: ${subject}\n  body: ${html}\n`);
    return;
  }

  const { error, headers } = await resend.emails.send({
    from: "BirdPlan.app <support@birdplan.app>",
    to,
    subject,
    html,
    replyTo,
  });

  await notifyQuotas(headers);

  if (error) {
    console.error(`[resend] failed to send email to ${to}: ${error.name} — ${error.message}`);
    throw new HTTPException(503, {
      message: "We're unable to send emails right now. Please try again in a few minutes.",
    });
  }
};

type inviteEmailProps = {
  tripName: string;
  fromName: string;
  email: string;
  url: string;
};

export const sendInviteEmail = async ({ tripName, fromName, email, url }: inviteEmailProps) => {
  await sendEmail({
    to: email,
    subject: `${fromName} has invited you to join ${tripName}`,
    html: `Hello,<br /><br />${fromName} invited you to join their trip called '${tripName}'.<br /><br /><a href="${url}">Accept Invite</a><br /><br />This invite expires in ${INVITE_EXPIRATION_DAYS} days.`,
    replyTo: email,
  });
};

type otpEmailProps = {
  email: string;
  code: string;
};

export const sendOtpEmail = async ({ email, code }: otpEmailProps) => {
  await sendEmail({
    to: email,
    subject: `${code} is your BirdPlan.app sign-in code`,
    html: `Hello,<br /><br />Your BirdPlan.app sign-in code is:<br /><br /><div style="font-size:28px;font-weight:bold;letter-spacing:4px;">${code}</div><br />This code expires in ${OTP_EXPIRATION_MINUTES} minutes. If you didn't request it, you can safely ignore this email.`,
  });
};
