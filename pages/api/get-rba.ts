import { distanceBetween } from "lib/helpers";
import taxonomy from "../../taxonomy.json";
import type { NextApiRequest, NextApiResponse } from "next";
import ABASpecies from "../../aba-species.json";

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
  subnational1Code: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const country = "US";
  const excludeStates = ["US-HI", "US-AK"];

  const response = await fetch(
    `https://api.ebird.org/v2/data/obs/${country}/recent/notable?detail=full&back=2&key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`
  );
  let reports: RbaResponse[] = await response.json();

  if (!reports?.length) {
    return res.status(200).json([]);
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
    .filter(
      ({ comName, subnational1Code }) => !comName.includes("(hybrid)") && !excludeStates.includes(subnational1Code)
    )
    .map((item) => ({ ...item, distance: parseInt(item.distance.toString()) }));

  const reportsBySpecies: any = {};

  reports.forEach((item) => {
    if (!reportsBySpecies[item.speciesCode]) {
      // @ts-ignore
      const abaCode = ABASpecies[item.sciName]?.abaCode;
      reportsBySpecies[item.speciesCode] = {
        name: item.comName,
        code: item.speciesCode,
        abaCode,
        reports: [],
      };
    }
    reportsBySpecies[item.speciesCode].reports.push(item);
  });

  const species = Object.entries(reportsBySpecies).map(([key, value]) => value);

  res.status(200).json([...species]);
}
