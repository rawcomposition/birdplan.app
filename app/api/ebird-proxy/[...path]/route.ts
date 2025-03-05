export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  const { path } = await params;
  const { searchParams } = new URL(request.url);

  if (!path.length) {
    return Response.json({ error: "Path parameter is required" }, { status: 400 });
  }

  const url = `https://api.ebird.org/v2/${path.join("/")}?${searchParams.toString()}`;

  const response = await fetch(url);
  return Response.json(await response.json());
}
