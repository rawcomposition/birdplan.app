import type { NextApiRequest, NextApiResponse } from "next";
import { JSDOM } from "jsdom";
import { BFHotspot } from "lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { id, lat, lng, radius, month } = req.query;
    const request = await fetch(
      `https://www.michaelfogleman.com/birds/where/${id}?lat=${lat}&lng=${lng}&radius_mi=${radius}&month=${month}`
    );
    const html = await request.text();

    const dom = new JSDOM(html);
    const tableRows = dom.window.document.querySelectorAll("table tbody tr");

    const results: BFHotspot[] = [];

    tableRows?.forEach((row) => {
      const a = row.querySelector("a[href^='/birds/what']");
      const name = a?.textContent;
      const sampleSize = Number(row.querySelectorAll("td")[6].textContent);
      const percent = Number(row.querySelectorAll("td")[7].textContent?.replace("%", ""));
      const ebirdLinkA = row.querySelector("a[href^='https://ebird.org/media']");
      const ebirdLink = ebirdLinkA?.getAttribute("href");
      const locationId = ebirdLink?.split("hotspotCode=").pop();
      if (!name || !id || !percent || !locationId) return;
      results.push({
        locationId,
        name,
        percent,
        sampleSize,
      });
    });

    const sortedResults = results.sort((a, b) => b.percent - a.percent);

    res.status(200).json({ success: true, results: sortedResults });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
