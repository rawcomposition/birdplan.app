import { Hono } from "hono";
import { connect, QuizImages } from "lib/db.js";
import type { QuizImages as QuizImagesT } from "shared/types.js";

const quiz = new Hono();

type eBirdResponse = {
  results: {
    content: {
      assetId: string;
      commonName: string;
    }[];
  };
};

quiz.post("/generate", async (c) => {
  const { codes } = await c.req.json<{ codes: string[] }>();

  await connect();

  const savedImages = await QuizImages.find({ code: { $in: codes } }).lean();

  const steps = await Promise.all(
    codes.map(async (code: string) => {
      try {
        let savedItem: QuizImagesT | null = savedImages.find((it) => it.code === code) || null;
        if (!savedItem) {
          const res = await fetch(
            `https://search.macaulaylibrary.org/api/v1/search?count=20&sort=rating_rank_desc&mediaType=p&regionCode=&taxonCode=${code}&taxaLocale=en`
          );
          const data: eBirdResponse = await res.json();
          const results = data.results.content;
          const ids = results.map((it) => it.assetId);
          const name = results[0].commonName;
          const newItem = { code, ids, name };
          const item = await QuizImages.create(newItem);
          savedItem = item.toObject();
        }
        const mlId = savedItem?.ids[Math.floor(Math.random() * savedItem?.ids.length)];
        return {
          name: savedItem?.name,
          code: savedItem?.code,
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

  return c.json(filteredSteps);
});

export default quiz;
