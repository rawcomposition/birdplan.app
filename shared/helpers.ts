export const isHotspotInRegion = (hotspotRegionCode: string, tripRegion: string): boolean => {
  const code = hotspotRegionCode.toUpperCase();
  return tripRegion
    .split(",")
    .map((it) => it.trim().toUpperCase())
    .filter(Boolean)
    .some((it) => code === it || code.startsWith(`${it}-`));
};
