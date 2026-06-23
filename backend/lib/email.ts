import { Resend } from "resend";
import { OTP_EXPIRATION_MINUTES, INVITE_EXPIRATION_DAYS, IS_DEV } from "lib/config.js";

const resend = new Resend(process.env.RESEND_API_KEY);

type Props = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export const sendEmail = async ({ to, subject, html, replyTo }: Props) => {
  if (IS_DEV) {
    console.log(`\n📧 [dev] email not sent\n  to: ${to}\n  subject: ${subject}\n  body: ${html}\n`);
    return;
  }

  await resend.emails.send({
    from: "BirdPlan.app <support@birdplan.app>",
    to,
    subject,
    html,
    replyTo,
  });
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
