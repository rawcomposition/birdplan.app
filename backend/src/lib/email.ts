import { Resend } from "resend";
import { RESET_TOKEN_EXPIRATION } from "lib/config.js";

const resend = new Resend(process.env.RESEND_API_KEY);

type Props = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export const sendEmail = async ({ to, subject, html, replyTo }: Props) => {
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
    html: `Hello,<br /><br />${fromName} invited to join their trip called '${tripName}'.<br /><br /><a href=${url}>Accept Invite</a>`,
    replyTo: email,
  });
};

type resetEmailProps = {
  email: string;
  url: string;
};

export const sendResetEmail = async ({ email, url }: resetEmailProps) => {
  await sendEmail({
    to: email,
    subject: "Reset your BirdPlan.app password",
    html: `Hello,<br /><br />Click the link below to reset your BirdPlan.app password.<br /><br /><a href="${url}">Reset Password</a><br /><br />This link will expire in ${RESET_TOKEN_EXPIRATION} hours. If you did not request a password reset, please ignore this email.`,
  });
};
