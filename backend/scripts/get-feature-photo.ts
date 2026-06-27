import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const USER_AGENT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const IMAGE_SIZE = 1800;
const projectRoot = path.join(fileURLToPath(import.meta.url), "../../..");
const dataFile = path.join(projectRoot, "frontend/data/feature-photos.json");
const imageDir = path.join(projectRoot, "frontend/public/feature-photos");

const LICENSES: Record<string, string> = {
  LICENSE5: "CC BY 4.0",
  LICENSE8: "CC BY-NC 4.0",
  LICENSE9: "CC BY-SA 4.0",
  LICENSE10: "CC0 1.0",
};

type FeaturePhoto = {
  sourceId: string;
  photographer: string;
  location: string;
  date: string;
  license: string;
  downloadedAt: string;
};

type MLLocation = {
  name: string;
  countryName: string | null;
  subnational1Name: string | null;
  subnational2Name: string | null;
  locality: string | null;
};

type MLAsset = {
  assetId: number;
  userDisplayName: string;
  obsDtDisplay: string;
  licenseId: string;
  location: MLLocation;
};

const composeLocation = (loc: MLLocation) =>
  [loc.locality || loc.name, loc.subnational2Name, loc.subnational1Name, loc.countryName].filter(Boolean).join(", ");

const downloadImage = async (assetId: string, sourceId: string) => {
  const url = `https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${assetId}/${IMAGE_SIZE}`;
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`image HTTP ${response.status}`);
  fs.mkdirSync(imageDir, { recursive: true });
  fs.writeFileSync(path.join(imageDir, `${sourceId}.jpg`), Buffer.from(await response.arrayBuffer()));
};

const fetchPhoto = async (input: string): Promise<FeaturePhoto> => {
  const assetId = input.trim().replace(/^ML/i, "");
  if (!/^\d+$/.test(assetId)) throw new Error(`Invalid asset ID: ${input}`);

  const url = `https://ebird.org/ml-search-api/v2/search?assetId=${assetId}&taxaLocale=en&count=1`;
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const [asset]: MLAsset[] = await response.json();
  if (!asset) throw new Error("No asset found");

  const license = LICENSES[asset.licenseId];
  if (!license) throw new Error(`Disallowed license: ${asset.licenseId}`);

  const sourceId = `ML${asset.assetId}`;
  await downloadImage(assetId, sourceId);

  return {
    sourceId,
    photographer: asset.userDisplayName,
    location: composeLocation(asset.location),
    date: asset.obsDtDisplay,
    license,
    downloadedAt: new Date().toISOString(),
  };
};

const readPhotos = (): FeaturePhoto[] =>
  fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, "utf8")) : [];

const run = async () => {
  const inputs = process.argv.slice(2);
  if (inputs.length === 0) {
    console.error("Usage: npm run get-feature-photo -- <assetId> [assetId...]");
    process.exit(1);
  }

  const photos = readPhotos();

  for (const input of inputs) {
    try {
      const photo = await fetchPhoto(input);
      const index = photos.findIndex((p) => p.sourceId === photo.sourceId);
      if (index === -1) photos.push(photo);
      else photos[index] = photo;
      console.log(`✓ ${photo.sourceId} — ${photo.photographer}, ${photo.location}`);
    } catch (error) {
      console.error(`✗ ${input}: ${error instanceof Error ? error.message : error}`);
    }
  }

  fs.writeFileSync(dataFile, JSON.stringify(photos, null, 2) + "\n");
};

run();
