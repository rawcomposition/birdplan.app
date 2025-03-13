import { NextRequest, NextResponse } from "next/server";
import { connect, Vault } from "lib/db";
import { APIError } from "lib/api";
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key || key !== process.env.PIPER_KEY) {
      return NextResponse.json({ error: "Invalid key" }, { status: 401 });
    }

    const rawBody = await req.text();
    if (!rawBody) {
      return NextResponse.json({ error: "Missing body" }, { status: 400 });
    }

    await connect();
    await Vault.updateOne({ key: "ebird-tools" }, { value: rawBody }, { upsert: true });

    return new NextResponse("Success", { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return APIError(error instanceof Error ? error.message : "Error updating cookiejar", 500);
  }
}
