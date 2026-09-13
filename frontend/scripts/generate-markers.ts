// Requires sharp, which is not a dependency: `ln -s $(npm root -g)/sharp node_modules/sharp` after `npm i -g sharp`.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { icons, markerIcons } from "../lib/icons";
import { markerColors } from "../lib/helpers";

const OUT_DIR = path.join(import.meta.dirname, "..", "public", "markers");
const SIZE = 64;
const DELETED_COLOR = "#9ca3af";

const discSvg = (color: string, stroke = "#555") =>
  `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="20" fill="${color}" stroke="${stroke}" stroke-width="1"/></svg>`;

const starSvg = (color: string) =>
  `<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" fill="${color}"><path d="M341.5,45.1C337.4,37.1 329.1,32 320.1,32C311.1,32 302.8,37.1 298.7,45.1L235.1,200.3L65.2,214.7C56.3,216.1 48.9,222.4 46.1,231C43.3,239.6 45.6,249 51.9,255.4L190.3,356.9L141.1,529.8C139.7,538.7 143.4,547.7 150.7,553C158,558.3 167.6,559.1 175.7,555L319.1,463.6L464.4,555C472.4,559.1 482.1,558.3 489.4,553C496.7,547.7 500.4,538.8 499,529.8L455.7,369.9L588.1,255.4C594.5,249 596.7,239.6 593.9,231C591.1,222.4 583.8,216.1 574.8,214.7L407,206.3L341.5,45.1Z"/></svg>`;

const iconSvg = (name: keyof typeof icons, color: string) =>
  `<svg viewBox="${icons[name].viewbox}" xmlns="http://www.w3.org/2000/svg" fill="${color}"><path d="${icons[name].path}"/></svg>`;

const hexToHsl = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6 : max === g ? ((b - r) / d + 2) / 6 : ((r - g) / d + 4) / 6;
  return [h, s, l];
};

const relativeLuminance = (hex: string) => {
  const linearize = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const r = linearize(parseInt(hex.slice(1, 3), 16) / 255);
  const g = linearize(parseInt(hex.slice(3, 5), 16) / 255);
  const b = linearize(parseInt(hex.slice(5, 7), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const starColor = (bg: string) => {
  const [h, s, l] = hexToHsl(bg);
  const [hh, ss, ll] = relativeLuminance(bg) > 0.3 ? [h, s * 0.7, l * 0.4] : [h, s * 0.35, l + (1 - l) * 0.85];
  return `hsl(${Math.round(hh * 360)}, ${Math.round(ss * 100)}%, ${Math.round(ll * 100)}%)`;
};

const makeMarker = async (name: string, disc: string, icon: string, iconScale: number) => {
  const iconSize = Math.round(SIZE * iconScale);
  const overlay = await sharp(Buffer.from(icon)).resize(iconSize, iconSize, { fit: "inside" }).toBuffer();
  await sharp(Buffer.from(disc))
    .resize(SIZE, SIZE)
    .composite([{ input: overlay, gravity: "center" }])
    .png()
    .toFile(path.join(OUT_DIR, `${name}.png`));
};

const main = async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [i, color] of markerColors.entries()) {
    await makeMarker(`saved-hotspot-${i}`, discSvg(color), starSvg(starColor(color)), 0.58);
  }
  await makeMarker("deleted-hotspot", discSvg(DELETED_COLOR, "#6b7280"), iconSvg("xMarkBold", "#f3f4f6"), 0.5);
  for (const [name, def] of Object.entries(markerIcons)) {
    await makeMarker(`place-${name}`, discSvg(def.color), iconSvg(def.icon, "white"), 0.5);
  }
  console.log("Markers generated");
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
