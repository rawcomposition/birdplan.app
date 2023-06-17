import type { NextApiRequest, NextApiResponse } from "next";
import * as deepl from "deepl-node";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text } = req.body;
  try {
    const authKey = process.env.DEEPL_KEY || "";
    const translator = new deepl.Translator(authKey);

    //@ts-ignore
    const response = await translator.translateText(text, null, "EN-US");
    //@ts-ignore
    const translatedText = response.text;

    res.status(200).json({ success: true, text: translatedText });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
