import TimezonesJson from "../timezones-flat.json";
const Timezones = TimezonesJson as Record<string, string>;

export const getTzByRegion = (regionCode: string) => {
  if (!regionCode) return "Etc/UTC";
  const codePieces = regionCode.split("-").filter(Boolean);
  const countryCode = codePieces[0];
  const stateCode = codePieces[1] ? `${codePieces[0]}-${codePieces[1]}` : codePieces[0];

  const tz = Timezones[stateCode] || Timezones[countryCode] || "Etc/UTC";
  return tz;
};
