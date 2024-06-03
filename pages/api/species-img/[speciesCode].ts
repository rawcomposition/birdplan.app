import type { NextApiRequest, NextApiResponse } from "next";
import Images from "../../../species-images.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { speciesCode } = req.query;

    const img = Images.find((i) => i.code === speciesCode);
    const url = img?.url || `${process.env.NEXT_PUBLIC_URL}/placeholder.png`;

    const sevenDays = 604800;
    res.setHeader("Cache-Control", `public, max-age=${sevenDays}, s-maxage=${sevenDays}`);
    res.redirect(307, url);
  } catch (error) {
    res.status(500).json({ error });
  }
}
