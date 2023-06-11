import type { NextApiRequest, NextApiResponse } from "next";
import { JSDOM } from "jsdom";
import { BFTarget } from "lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { lat, lng, radius, month } = req.query;
    const request = await fetch(
      `https://www.michaelfogleman.com/birds/?lat=${lat}&lng=${lng}&radius_mi=${radius}&month=${month}`
    );
    const html = await request.text();

    const dom = new JSDOM(html);
    const tableRows = dom.window.document.querySelectorAll("table tbody tr");

    const results: BFTarget[] = [];

    tableRows?.forEach((row) => {
      const a = row.querySelector("a[href^='/birds/where/']");
      const name = a?.textContent;
      const link = a?.getAttribute("href");
      const id = link?.split("/").pop()?.split("?")[0];
      const percent =
        month === "0"
          ? Number(row.querySelector("td:last-child")?.textContent?.replace("%", ""))
          : Number(row.querySelectorAll("td")[6].textContent?.replace("%", ""));
      const ebirdLinkA = row.querySelector("a[href^='https://ebird.org/species/']");
      const ebirdLink = ebirdLinkA?.getAttribute("href");
      const code = ebirdLink?.split("/").pop();
      if (!name || !id || !percent || !code) return;
      if (name.includes("(hybrid)") || name.includes("sp.") || name.includes("/")) return;
      results.push({
        id,
        name,
        percent,
        code,
      });
    });

    res.setHeader("Cache-Control", "max-age=0, s-maxage=2592000"); //Cache for 30 days
    res.status(200).json({ success: true, results });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
