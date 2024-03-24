import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "lib/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const key = req.query.key;

    if (!key || key !== process.env.PIPER_KEY) {
      throw new Error("Invalid key");
    }

    const data = await db.collection("vault").doc("ebird-tools").get();
    const { cookiejar } = data.data() || {};

    if (!cookiejar) throw new Error("Cookiejar not found");

    res.status(200).send(cookiejar);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
