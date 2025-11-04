import { Trip } from "@birdplan/shared";
import dayjs from "dayjs";
import { customAlphabet } from "nanoid";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getTzByRegion } from "lib/tz";
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fullMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "Novermber",
  "December",
];

export const englishCountries = [
  "US",
  "CA",
  "AU",
  "GB",
  "NZ",
  "IE",
  "GH",
  "SG",
  "BZ",
  "ZA",
  "IN",
  "DM",
  "MT",
  "AG",
  "KE",
  "JM",
  "GD",
  "GY",
  "BW",
  "LR",
  "BB",
  "CM",
  "NG",
  "GM",
  "TT",
  "BS",
];

export const isRegionEnglish = (region: string) => {
  const regionCode = region.split(",")[0];
  const countryCode = regionCode.split("-")[0];
  return englishCountries.includes(countryCode);
};

export function truncate(string: string, length: number): string {
  return string.length > length ? `${string.substring(0, length)}...` : string;
}

export const markerColors = [
  "#bcbcbc",
  "#8f9ca0",
  "#9bc4cf",
  "#aaddeb",
  "#c7e466",
  "#eaeb1f",
  "#fac500",
  "#e57701",
  "#ce0d02",
  "#ad0002",
];

export const getMarkerColor = (count: number) => {
  if (count === 0) return markerColors[0];
  if (count <= 15) return markerColors[1];
  if (count <= 50) return markerColors[2];
  if (count <= 100) return markerColors[3];
  if (count <= 150) return markerColors[4];
  if (count <= 200) return markerColors[5];
  if (count <= 250) return markerColors[6];
  if (count <= 300) return markerColors[7];
  if (count <= 400) return markerColors[8];
  if (count <= 1000) return markerColors[9];
  return markerColors[0];
};

export const getMarkerColorIndex = (count: number) => {
  const color = getMarkerColor(count);
  return markerColors.indexOf(color);
};

export const radiusOptions = [
  { label: "20 mi", value: 20 },
  { label: "50 mi", value: 50 },
  { label: "100 mi", value: 100 },
  { label: "200 mi", value: 200 },
  { label: "300 mi", value: 300 },
  { label: "400 mi", value: 400 },
  { label: "500 mi", value: 500 },
];

export const getLatLngFromBounds = (bounds?: Trip["bounds"]) => {
  if (!bounds) return { lat: null, lng: null };
  const { minX, minY, maxX, maxY } = bounds;
  const lat = (minY + maxY) / 2;
  const lng = (minX + maxX) / 2;
  return { lat, lng };
};

export const nanoId = (length: number = 16) => {
  return customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", length)();
};

export const dateTimeToRelative = (date: string, regionCode: string, includeAgo?: boolean) => {
  const timezone = getTzByRegion(regionCode);
  if (!regionCode || !date) return "";

  const today = dayjs().tz(timezone).format("YYYY-MM-DD");
  const yesterday = dayjs().tz(timezone).subtract(1, "day").format("YYYY-MM-DD");
  const tomorrow = dayjs().tz(timezone).add(1, "day").format("YYYY-MM-DD");
  const dateFormatted = dayjs(date).tz(timezone).format("YYYY-MM-DD");
  if (dateFormatted === today || dateFormatted === tomorrow) return "Today";
  if (dateFormatted === yesterday) return "Yesterday";
  const result = dayjs
    .tz(date, timezone)
    .fromNow()
    .replace(includeAgo ? "" : " ago", "")
    .replace("an ", "1 ")
    .replace("a ", "1 ");

  return result;
};

//https://decipher.dev/30-seconds-of-typescript/docs/debounce/
export const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

export const formatTime = (time: number) => {
  const rounded = Math.round(time);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
};

export const formatDistance = (meters: number, metric: boolean) => {
  const distance = metric ? meters / 1000 : meters / 1609;
  const units = metric ? "km" : "mi";
  const rounded =
    distance > 10
      ? Math.round(distance)
      : distance > 1
      ? Math.round(distance * 10) / 10
      : Math.round(distance * 100) / 100;
  return `${rounded} ${units}`;
};

export function getRandomItemsFromArray(arr: any[], count: number): any[] {
  const result: string[] = [];

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    result.push(arr[randomIndex]);
  }

  return result;
}

export function getGooglePlaceUrl(lat: number, lng: number, placeId?: string) {
  return placeId
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${placeId}`
    : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
