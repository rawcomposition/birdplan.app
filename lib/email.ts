import nodemailer from "nodemailer";

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
