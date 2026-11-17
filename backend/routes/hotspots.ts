import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import dayjs from "dayjs";

const hotspots = new Hono();

const fetchFollowingCookieRedirects = async (url: string, headers: Record<string, string>, maxRedirects = 6) => {
  const cookiesByHost = new Map<string, Map<string, string>>();
  let current = url;

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const { host } = new URL(current);
    const cookies = cookiesByHost.get(host) ?? new Map<string, string>();
    cookiesByHost.set(host, cookies);
    const cookieHeader = [...cookies].map(([name, value]) => `${name}=${value}`).join("; ");

    const response = await fetch(current, {
      redirect: "manual",
      headers: cookieHeader ? { ...headers, Cookie: cookieHeader } : headers,
    });

    response.headers.getSetCookie().forEach((setCookie) => {
      const pair = setCookie.split(";")[0];
      const separator = pair.indexOf("=");
      if (separator > 0) cookies.set(pair.slice(0, separator).trim(), pair.slice(separator + 1).trim());
    });

    const location = response.headers.get("location");
    if (response.status < 300 || response.status >= 400 || !location) return response;
    current = new URL(location, current).toString();
  }

  throw new HTTPException(502, { message: "Too many redirects from eBird" });
};

hotspots.get("/:hotspotId/obs", async (c) => {
  const hotspotId = c.req.param("hotspotId");
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });

  const speciesCode = c.req.query("speciesCode");

  const year = dayjs().year();
  const url = `https://ebird.org/mapServices/getLocInfo.do?fmt=json&locID=${hotspotId}&speciesCodes=${speciesCode}&evidSort=false&excludeExX=false&excludeExAll=false&byr=1900&eyr=${year}&yr=all&bmo=1&emo=12`;

  const response = await fetchFollowingCookieRedirects(url, {
    "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  });
  if (!response.ok) throw new HTTPException(502, { message: "Failed to load eBird observations" });

  const data = await response.json();

  const formatted = data.infoList.map((info: any) => {
    return {
      checklistId: info.subID,
      count: info.howMany,
      date: info.obsDt,
      evidence: info.evidence,
    };
  });

  const oneHour = 60 * 60;

  c.header("Cache-Control", `public, max-age=${oneHour}, s-maxage=${oneHour}`);

  return c.json(formatted);
});

export default hotspots;
