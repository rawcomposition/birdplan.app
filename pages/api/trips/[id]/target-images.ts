import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "lib/firebaseAdmin";
import { Targets } from "lib/types";
import Images from "../../../../species-images.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const id = req.query.id as string;

    const targets = await db.collection("targets").doc(id).get();

    if (!targets.exists) {
      return res.status(200).json([]);
    }

    const data = (targets.data() as Targets) || [];

    const targetCodes = data.items.map((t) => t.code);

    const filteredImages = Images.filter((i) => targetCodes.includes(i.code));

    res.status(200).json(filteredImages);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
