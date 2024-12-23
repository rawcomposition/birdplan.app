import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "lib/firebaseAdmin";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const key = req.query.key;

    if (!key || key !== process.env.PIPER_KEY) throw new Error("Invalid key");

    let rawBody = "";
    await new Promise<void>((resolve, reject) => {
      req.on("data", (chunk) => {
        rawBody += chunk.toString(); // Collect raw body
      });
      req.on("end", resolve);
      req.on("error", reject);
    });

    if (!rawBody) throw new Error("Missing body");

    await db.collection("vault").doc("ebird-tools").set({ cookiejar: rawBody });

    res.status(200).send("Success");
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
