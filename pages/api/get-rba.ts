import { distanceBetween } from "lib/helpers";
import taxonomy from "../../taxonomy.json";
import type { NextApiRequest, NextApiResponse } from "next";

type RbaResponse = {
  obsId: string;
  speciesCode: string;
  comName: string;
  sciName: string;
  locId: string;
  locName: string;
  obsDt: string;
  howMany: number;
  lat: number;
  lng: number;
  obsValid: boolean;
  obsReviewed: boolean;
  locationPrivate: boolean;
  subId: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = Number(req.query.radius);
  const country = "US";

  const response = await fetch(
    `https://api.ebird.org/v2/data/obs/${country}/recent/notable?detail=full&key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`
  );
  let reports: RbaResponse[] = await response.json();

  if (!reports?.length) {
    res.status(200).json([]);
  }

  reports = reports
    //Remove duplicates. For unknown reasons, eBird sometimes returns duplicates
    .filter((value, index, array) => array.findIndex((searchItem) => searchItem.obsId === value.obsId) === index)
    .map((item) => {
      const distance = parseFloat(distanceBetween(lat, lng, item.lat, item.lng, false).toFixed(2));
      const { comName, sciName, speciesCode } = item;
      const taxon = taxonomy.find((item) => item.sci === sciName);
      return {
        ...item,
        distance,
        comName: taxon?.name || comName,
        speciesCode: taxon?.code || speciesCode,
      };
    })
    .filter(({ distance, comName }) => distance <= radius && !comName.includes("(hybrid)"))
    .map((item) => ({ ...item, distance: parseInt(item.distance.toString()) }));

  const reportsBySpecies: any = {};

  reports.forEach((item) => {
    if (!reportsBySpecies[item.speciesCode]) {
      reportsBySpecies[item.speciesCode] = {
        name: item.comName,
        sciName: item.sciName,
        code: item.speciesCode,
        reports: [],
      };
    }
    reportsBySpecies[item.speciesCode].reports.push(item);
  });

  const species = Object.entries(reportsBySpecies).map(([key, value]) => value);

  res.status(200).json([...species]);
}
