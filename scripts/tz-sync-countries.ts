import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import { RegionTz } from "lib/types";
import { getBounds, getCenterOfBounds, getTimezone } from "lib/helpers";

const WAIT = 1000;

const downloadAndSaveData = async () => {
  try {
    const filePath = path.join(__dirname, "../public/timezones.json");

    let oldData: RegionTz[] = [];
    if (fs.existsSync(filePath)) {
      const file = fs.readFileSync(filePath, "utf8");
      oldData = JSON.parse(file) as RegionTz[];
    }

    const countriesReq = await fetch(
      `https://api.ebird.org/v2/ref/region/list/country/world?key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`
    );
    if (!countriesReq.ok) {
      throw new Error(`HTTP error: ${countriesReq.status}`);
    }
    const countries = await countriesReq.json();
    const newData: RegionTz[] = [];
    for (const country of countries) {
      const oldCountry = oldData.find((it) => it.code === country.code);
      const bounds = await getBounds(country.code);
      const { lat, lng } = getCenterOfBounds(bounds);
      const tz = await getTimezone(lat, lng);
      if (!tz) console.error(`No timezone found for ${country.code}`);
      const data = {
        code: country.code,
        subregions: oldCountry?.subregions || [],
        tz: tz || null,
      };
      console.log(data);
      newData.push(data);
    }

    fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));

    console.log(`Synced ${newData.length} countries`);
  } catch (error) {
    console.error(error);
  }
};

downloadAndSaveData();
