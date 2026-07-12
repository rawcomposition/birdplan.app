import Papa from "papaparse";

export type LifelistCsvErrorKind = "dataDownload" | "unrecognized";

export class LifelistCsvError extends Error {
  kind: LifelistCsvErrorKind;
  constructor(kind: LifelistCsvErrorKind) {
    super(kind);
    this.name = "LifelistCsvError";
    this.kind = kind;
  }
}

const REQUIRED_FIELDS = ["Scientific Name", "Category", "Countable"];
const isDataDownload = (fields: string[]) => fields.includes("Submission ID") && !fields.includes("Countable");

export function parseLifelistCsv(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results: any) => {
        const fields: string[] = results.meta?.fields ?? [];
        if (isDataDownload(fields)) {
          reject(new LifelistCsvError("dataDownload"));
          return;
        }
        if (!REQUIRED_FIELDS.every((field) => fields.includes(field))) {
          reject(new LifelistCsvError("unrecognized"));
          return;
        }
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
