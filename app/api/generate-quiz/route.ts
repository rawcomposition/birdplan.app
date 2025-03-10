import { APIError } from "lib/api";
import { connect, QuizImages } from "lib/db";
import { QuizImages as QuizImagesT } from "lib/types";
export async function POST(request: Request) {
  try {
    const { codes }: { codes: string[] } = await request.json();

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
            const data = await res.json();
            const results = data.results.content;
            const ids = results.map((it: any) => it.assetId);
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

    return Response.json(filteredSteps);
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error creating trip", 500);
  }
}
