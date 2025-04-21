import { APIError } from "lib/api";
import { sendEmail } from "lib/email";

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

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, type, message, browserInfo } = data as SupportRequest;

    if (!name || !email || !type || !message) {
      return APIError("Missing required fields", 400);
    }

    // Basic spam detection
    if (message.toUpperCase().includes("SEO")) {
      return Response.json({ success: true });
    }

    const html = `
      <h2>New Support Message</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br />")}</p>
      <hr />
      <h3>User Information</h3>
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

    return Response.json({ success: true });
  } catch (error: unknown) {
    console.error("Support form error:", error);
    return APIError(error instanceof Error ? error.message : "Failed to send message", 500);
  }
}
