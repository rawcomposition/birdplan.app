export const sendNtfyNotification = async (title: string, message: string) => {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;
  try {
    await fetch("https://ntfy.sh", {
      method: "POST",
      body: JSON.stringify({ topic, title, message }),
    });
  } catch (err) {
    console.error(`[ntfy] failed to send notification: ${err instanceof Error ? err.message : err}`);
  }
};
