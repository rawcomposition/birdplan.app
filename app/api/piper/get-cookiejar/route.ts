import { Vault, connect } from "lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const key = searchParams.get("key");
    if (!key || key !== process.env.PIPER_KEY) {
      return Response.json({ error: "Invalid key" }, { status: 401 });
    }

    await connect();
    const vault = await Vault.findOne({ key: "ebird-tools" });
    const cookiejar = vault?.value || "";

    return new Response(cookiejar, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error(error);
    return new Response("", {
      headers: { "Content-Type": "text/plain" },
    });
  }
}
