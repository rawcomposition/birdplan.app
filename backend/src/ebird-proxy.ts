import { Hono } from "hono";

const ebirdProxy = new Hono();

ebirdProxy.get("/*", async (c) => {
  const path: string | undefined = c.req.param("*");
  const searchParams: URLSearchParams = new URLSearchParams(c.req.query());

  if (!path) {
    return c.json({ error: "Path parameter is required" }, 400);
  }

  const url: string = `https://api.ebird.org/v2/${path}?${searchParams.toString()}`;

  const response = await fetch(url);
  const data = await response.json();

  return c.json(data);
});

export default ebirdProxy;
