import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import { RegionTz } from "lib/types";
import { getBounds, getCenterOfBounds, getTimezone } from "lib/helpers";

type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

const WAIT = 1000;

const downloadAndSaveData = async () => {
  try {
    const filePath = path.join(__dirname, "../timezones.json");

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
      let bounds: Bounds;
      try {
        bounds = await getBounds(country.code);
      } catch (error) {
        console.error(`Error getting bounds for ${country.code}: ${error}`);
        newData.push({
          code: country.code,
          tz: "Etc/UTC",
          ...(oldCountry?.subregions ? { subregions: oldCountry.subregions } : {}),
        });
        continue;
      }
      const { lat, lng } = getCenterOfBounds(bounds);
      const tz = await getTimezone(lat, lng);
      if (!tz) console.warn(`No timezone found for ${country.code}. Using Etc/UTC.`);
      const data = {
        code: country.code,
        ...(oldCountry?.subregions ? { subregions: oldCountry.subregions } : {}),
        tz: tz || null,
      };
      console.log(data);
      newData.push(data);
      await new Promise((resolve) => setTimeout(resolve, WAIT));
    }

    fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));

    console.log(`Synced ${newData.length} countries`);
  } catch (error) {
    console.error(error);
  }
};

downloadAndSaveData();
