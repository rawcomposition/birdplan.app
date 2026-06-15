import Papa from "papaparse";

export function parseLifelistCsv(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results: any) => {
        const sciNames = results.data
          .filter((it: any) => it.Countable === "1" && it.Category === "species")
          .map((it: any) => it["Scientific Name"]);
        resolve(sciNames);
      },
      error: reject,
    });
  });
}
