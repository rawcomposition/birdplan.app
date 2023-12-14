import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "lib/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { codes } = req.body;

    const imagesQuery = await db.collection("quizImages").where("code", "in", codes).get();
    const savedImages = imagesQuery.docs.map((doc) => doc.data());

    const steps = await Promise.all(
      codes.map(async (code: string) => {
        try {
          let savedItem = savedImages.find((it) => it.code === code);
          if (!savedItem) {
            const res = await fetch(
              `https://search.macaulaylibrary.org/api/v1/search?count=20&sort=rating_rank_desc&mediaType=p&regionCode=&taxonCode=${code}&taxaLocale=en`
            );
            const data = await res.json();
            const results = data.results.content;
            const ids = results.map((it: any) => it.assetId);
            const name = results[0].commonName;
            const newItem = { code, ids, name };
            await db.collection("quizImages").doc(code).set(newItem);
            savedItem = newItem;
          }
          const mlId = savedItem.ids[Math.floor(Math.random() * savedItem.ids.length)];
          return {
            name: savedItem.name,
            code: savedItem.code,
            mlId,
            guessName: "",
            isCorrect: false,
          };
        } catch (error) {
          return null;
        }
      })
    );

    const filteredSteps = steps.filter((it) => it !== null);

    res.status(200).json(filteredSteps);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
