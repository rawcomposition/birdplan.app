import { Hono } from "hono";

const ebirdProxy = new Hono();

ebirdProxy.get("/:path{.*}", async (c) => {
  const path: string | undefined = c.req.param("path");
  if (!path) {
    return c.json({ error: "Path parameter is required" }, 400);
  }

  const searchParams: URLSearchParams = new URLSearchParams(c.req.query());
  const apiKey = process.env.EBIRD_API_KEY;
  if (apiKey) {
    searchParams.set("key", apiKey);
  }

  const url: string = `https://api.ebird.org/v2/${path}?${searchParams.toString()}`;

  const response = await fetch(url);
  const data = await response.json();

  return c.json(data);
});

export default ebirdProxy;
