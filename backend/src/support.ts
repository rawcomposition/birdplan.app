import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { sendEmail } from "lib/email.js";

const support = new Hono();

type SupportRequest = {
  name: string;
  email: string;
  type: string;
  message: string;
  browserInfo: {
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
    userId: string;
  };
};

support.post("/", async (c) => {
  const data = await c.req.json<SupportRequest>();
  const { name, email, type, message, browserInfo } = data;

  if (!name || !email || !type || !message) {
    throw new HTTPException(400, { message: "Missing required fields" });
  }

  // Basic spam detection
  if (message.toUpperCase().includes("SEO")) {
    return Response.json({ success: true });
  }

  const html = `
    <p><strong>From:</strong> ${name} (${email})</p>
    <p><strong>Type:</strong> ${type}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, "<br />")}</p>
    <hr />
    <p><strong>User ID:</strong> ${browserInfo.userId}</p>
    <p><strong>Browser:</strong> ${browserInfo.userAgent}</p>
    <p><strong>Screen Size:</strong> ${browserInfo.screenWidth}x${browserInfo.screenHeight}</p>
  `;

  await sendEmail({
    to: "support@birdplan.app",
    subject: `BirdPlan.app Message from ${name}`,
    html,
    replyTo: email,
  });

  return c.json({ success: true });
});

export default support;
