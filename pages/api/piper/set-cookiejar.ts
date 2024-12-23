import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "lib/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const key = req.query.key;
    const body = req.body.toString(); // Convert to string to avoid JSON parsing
    console.log("TYPEOF", typeof body);
    console.log(body);

    if (!key || key !== process.env.PIPER_KEY) throw new Error("Invalid key");
    if (!body) throw new Error("Missing body");

    await db.collection("vault").doc("ebird-tools").set({ cookiejar: body });

    res.status(200).send("Success");
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
