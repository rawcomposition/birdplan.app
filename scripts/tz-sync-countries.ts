import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import { RegionTz } from "lib/types";

const syncCountries = async () => {
  console.log("Syncing countries...");
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

      const data = {
        code: country.code,
        tz: oldCountry?.tz || null,
        ...(oldCountry?.subregions && oldCountry.subregions.length > 0 ? { subregions: oldCountry.subregions } : {}),
      };

      newData.push(data);
    }

    fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));

    const countriesWithNullTz = newData.filter((it) => it.tz === null);

    console.log(`Synced ${newData.length} countries. ${countriesWithNullTz.length} need review.`);
  } catch (error) {
    console.error(error);
  }
};

syncCountries();
