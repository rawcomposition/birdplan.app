import nodemailer from "nodemailer";
import { RESET_TOKEN_EXPIRATION } from "lib/config";

type Props = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export const sendEmail = async ({ to, subject, html, replyTo }: Props) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    auth: {
      user: "noreply.birdinghotspots@gmail.com",
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: '"Bird Plan" <adam@rawcomposition.com>',
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
