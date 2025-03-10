export async function GET(request: Request, { params }: { params: { path: any } }) {
  const { path } = await params;
  const { searchParams } = new URL(request.url);

  if (!path.length) {
    return Response.json({ error: "Path parameter is required" }, { status: 400 });
  }

  const pathStr = Array.isArray(path) ? path.join("/") : path;

  const url = `https://api.ebird.org/v2/${pathStr}?${searchParams.toString()}`;

  const response = await fetch(url);
  return Response.json(await response.json());
}
