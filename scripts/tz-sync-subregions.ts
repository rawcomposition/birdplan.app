import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import { RegionTz } from "lib/types";
import { flattenTimezones } from "lib/helpers";

type SubRegionTz = Omit<RegionTz, "subregions">;

// Example usage: npm run tz-sync-subregions US

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

    const existingSubregions = allData[countryIndex].subregions || [];
    const newSubregionData: SubRegionTz[] = [];

    for (const subregion of subregions) {
      const existingSubregion = existingSubregions.find((it) => it.code === subregion.code);

      const data: SubRegionTz = {
        code: subregion.code,
        tz: existingSubregion?.tz || null,
      };

      newSubregionData.push(data);
    }

    allData[countryIndex].subregions = newSubregionData;
    const flattenedTimezones = flattenTimezones(allData);

    fs.writeFileSync(filePath, JSON.stringify(allData, null, 2));
    fs.writeFileSync(path.join(__dirname, "../timezones-flat.json"), JSON.stringify(flattenedTimezones, null, 2));
    const subregionsWithNullTz = newSubregionData.filter((it) => it.tz === null);
    console.log(
      `Updated ${newSubregionData.length} subregions of ${countryCode}. ${subregionsWithNullTz.length} need review.`
    );
  } catch (error) {
    console.error("An error occurred during the subregion timezone sync:", error);
    process.exit(1);
  }
};

const countryCodeArg = process.argv[2];
syncSubregionTimezones(countryCodeArg);
