import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import { RegionTz } from "lib/types";
import { flattenTimezones } from "lib/helpers";

type SubRegionTz = Omit<RegionTz, "subregions">;

const countriesWithMultipleTz = [
  "AU",
  "BR",
  "CA",
  "CL",
  "CD",
  "EC",
  "PF",
  "ID",
  "KZ",
  "KI",
  "MX",
  "FM",
  "MN",
  "NZ",
  "PG",
  "PT",
  "RU",
  "ES",
  "US",
  "UM",
];

const fetchSubregions = async (countryCode: string): Promise<SubRegionTz[]> => {
  try {
    const subregionsReq = await fetch(
      `https://api.ebird.org/v2/ref/region/list/subnational1/${countryCode}?key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`
    );

    if (!subregionsReq.ok) {
      throw new Error(`Failed to fetch subregions for ${countryCode}. Status: ${subregionsReq.status}`);
    }

    const subregions = await subregionsReq.json();

    if (!Array.isArray(subregions) || subregions.length === 0) {
      console.log(`No subregions found for ${countryCode}.`);
      return [];
    }

    return subregions.map((subregion) => ({
      code: subregion.code,
      tz: null,
    }));
  } catch (error) {
    console.error(`Error fetching subregions for ${countryCode}:`, error);
    return [];
  }
};

const syncCountries = async () => {
  console.log("Syncing countries and subregions...");
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
      const data: RegionTz = {
        code: country.code,
        tz: oldCountry?.tz || null,
      };

      if (countriesWithMultipleTz.includes(country.code)) {
        console.log(`Processing subregions for ${country.code}...`);

        let subregions: SubRegionTz[] = [];

        if (oldCountry?.subregions && oldCountry.subregions.length > 0) {
          const existingSubregions = oldCountry.subregions;
          const newSubregions = await fetchSubregions(country.code);

          subregions = newSubregions.map((newSubregion) => {
            const existingSubregion = existingSubregions.find((sub) => sub.code === newSubregion.code);
            return {
              code: newSubregion.code,
              tz: existingSubregion?.tz || null,
            };
          });
        } else {
          subregions = await fetchSubregions(country.code);
        }

        if (subregions.length > 0) {
          data.subregions = subregions;
          const subregionsWithNullTz = subregions.filter((sr) => sr.tz === null);
          console.log(`  Added ${subregions.length} subregions. ${subregionsWithNullTz.length} need timezone review.`);
        }
      } else if (oldCountry?.subregions && oldCountry.subregions.length > 0) {
        data.subregions = oldCountry.subregions;
      }

      newData.push(data);
    }

    const flattenedTimezones = flattenTimezones(newData);

    fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
    fs.writeFileSync(path.join(__dirname, "../timezones-flat.json"), JSON.stringify(flattenedTimezones, null, 2));

    const countriesWithNullTz = newData.filter((it) => it.tz === null);
    const subregionsWithNullTz = newData
      .filter((country) => country.subregions)
      .flatMap((country) => country.subregions || [])
      .filter((subregion) => subregion.tz === null);

    console.log(
      `Synced ${newData.length} countries. ${countriesWithNullTz.length} countries and ${subregionsWithNullTz.length} subregions need review.`
    );
  } catch (error) {
    console.error(error);
  }
};

syncCountries();
