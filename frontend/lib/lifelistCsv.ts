import Papa from "papaparse";

/**
 * Parse an eBird life list CSV export into a list of scientific names. Keeps only countable,
 * full-species rows (excludes subspecies, spuhs, slashes, etc.). Shared by every uploader so
 * the "what counts as a species" rule lives in one place.
 */
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
