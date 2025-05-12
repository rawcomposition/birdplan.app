import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import { RegionTz } from "../lib/types"; // Assuming RegionTz is in lib/types
import { getBounds, getCenterOfBounds, getTimezone } from "../lib/helpers"; // Assuming helpers are in lib/helpers

type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

type SubRegionTz = Omit<RegionTz, "subregions">;

const WAIT = 1000; // Delay between API calls in milliseconds

const syncSubregionTimezones = async (countryCode: string) => {
  if (!countryCode) {
    console.error("Error: Country code argument is required.");
    process.exit(1);
  }

  console.log(`Syncing timezones for subregions of country: ${countryCode}`);

  try {
    const filePath = path.join(__dirname, "../timezones.json");

    let allData: RegionTz[] = [];
    if (fs.existsSync(filePath)) {
      const file = fs.readFileSync(filePath, "utf8");
      allData = JSON.parse(file) as RegionTz[];
    } else {
      console.error(`Error: ${filePath} not found. Run country sync first.`);
      process.exit(1);
    }

    const countryIndex = allData.findIndex((it) => it.code === countryCode);
    if (countryIndex === -1) {
      console.error(`Error: Country code ${countryCode} not found in ${filePath}.`);
      process.exit(1);
    }

    const subregionsReq = await fetch(
      `https://api.ebird.org/v2/ref/region/list/subnational1/${countryCode}?key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`
    );

    if (!subregionsReq.ok) {
      throw new Error(`Failed to fetch subregions for ${countryCode}. Status: ${subregionsReq.status}`);
    }

    const subregions = await subregionsReq.json();

    if (!Array.isArray(subregions) || subregions.length === 0) {
      console.log(`No subregions found for ${countryCode}. No updates needed.`);
      return;
    }

    const newSubregionData: SubRegionTz[] = [];
    console.log(`Found ${subregions.length} subregions. Fetching timezones...`);

    for (const subregion of subregions) {
      let bounds: Bounds;
      try {
        bounds = await getBounds(subregion.code);
      } catch (error) {
        console.error(`Error getting bounds for subregion ${subregion.code}: ${error}. Skipping.`);
        newSubregionData.push({ code: subregion.code, tz: null });
        continue;
      }

      const { lat, lng } = getCenterOfBounds(bounds);
      let tz: string | null = null;
      try {
        tz = await getTimezone(lat, lng);
        if (!tz) {
          console.warn(`No timezone found for ${subregion.code} at (${lat}, ${lng}). Using null.`);
        }
      } catch (error) {
        console.error(`Error getting timezone for ${subregion.code}: ${error}. Using null.`);
      }

      const data: SubRegionTz = {
        code: subregion.code,
        tz: tz,
      };
      console.log(`  ${subregion.code}: ${tz || "Not found"}`);
      newSubregionData.push(data);
      await new Promise((resolve) => setTimeout(resolve, WAIT));
    }

    allData[countryIndex].subregions = newSubregionData;

    fs.writeFileSync(filePath, JSON.stringify(allData, null, 2));

    console.log(`Updated timezones for ${newSubregionData.length} subregions of ${countryCode}`);
  } catch (error) {
    console.error("An error occurred during the subregion timezone sync:", error);
    process.exit(1);
  }
};

const countryCodeArg = process.argv[2];
syncSubregionTimezones(countryCodeArg);
