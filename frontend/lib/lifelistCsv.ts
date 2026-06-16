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

export type LifelistCsvSpecies = { comName: string; sciName: string };

export function lifelistToCsv(species: LifelistCsvSpecies[]): string {
  const rows = species.map((it, i) => ({
    "Row #": i + 1,
    Category: "species",
    "Common Name": it.comName,
    "Scientific Name": it.sciName,
    Count: 1,
    Location: "",
    "S/P": "",
    Date: "",
    LocID: "",
    SubID: "",
    Countable: 1,
  }));
  return Papa.unparse(rows);
}
