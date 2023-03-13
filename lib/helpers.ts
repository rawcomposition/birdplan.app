export function truncate(string: string, length: number): string {
  return string.length > length ? `${string.substring(0, length)}...` : string;
}

// Adapted from https://www.geodatasource.com/developers/javascript
export function distanceBetween(lat1: number, lon1: number, lat2: number, lon2: number, metric = true): number {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  } else {
    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;
    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (metric) {
      dist = dist * 1.609344;
    }
    return parseFloat(dist.toFixed(2));
  }
}

export const getMarkerShade = (count: number) => {
  if (count === 0) return 1;
  if (count <= 15) return 2;
  if (count <= 50) return 3;
  if (count <= 100) return 4;
  if (count <= 150) return 5;
  if (count <= 200) return 6;
  if (count <= 250) return 7;
  if (count <= 300) return 8;
  if (count <= 400) return 9;
  if (count <= 500) return 10;
  return "#bcbcbc";
};

export const getRadiusForBounds = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km

  function toRad(x: number) {
    return (x * Math.PI) / 180;
  }

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const radius = R * c;
  //Unsure why this needs to be divided by 2, but it does
  return radius / 2;
};

export const radiusOptions = [
  { label: "5 mi", value: 5 },
  { label: "10 mi", value: 10 },
  { label: "20 mi", value: 20 },
  { label: "50 mi", value: 50 },
  { label: "100 mi", value: 100 },
  { label: "250 mi", value: 250 },
  { label: "350 mi", value: 350 },
  { label: "500 mi", value: 500 },
];
