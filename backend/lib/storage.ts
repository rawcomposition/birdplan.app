import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { nanoId } from "lib/utils.js";

const { S3_KEY_ID, S3_SECRET, S3_ENDPOINT, S3_BUCKET, S3_PUBLIC_URL } = process.env;

const hasS3Config = !!(S3_KEY_ID && S3_SECRET && S3_ENDPOINT && S3_BUCKET);
const publicUrl = S3_PUBLIC_URL?.replace(/\/+$/, "");

const client = hasS3Config
  ? new S3Client({
      region: "auto",
      endpoint: new URL(S3_ENDPOINT!).origin,
      forcePathStyle: true,
      credentials: {
        accessKeyId: S3_KEY_ID!,
        secretAccessKey: S3_SECRET!,
      },
    })
  : null;

export function imageUrl(fileName?: string | null): string | null {
  if (!fileName || !publicUrl) return null;
  return `${publicUrl}/${fileName}`;
}

export async function deleteFromStorage(key: string): Promise<void> {
  if (!client) return;
  await client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET!, Key: key }));
}

export function buildTripImageUrl(bounds: { minX: number; minY: number; maxX: number; maxY: number }): string {
  return `https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/static/[${bounds.minX},${bounds.minY},${bounds.maxX},${bounds.maxY}]/1280x640@2x?access_token=${process.env.MAPBOX_SERVER_KEY}&padding=128`;
}

export async function uploadMapboxImageToStorage(mapboxImageUrl: string): Promise<string | null> {
  if (!client) {
    console.warn("S3 storage not configured, skipping image upload");
    return null;
  }

  const res = await fetch(mapboxImageUrl);

  if (!res.ok) {
    console.error("Failed to load Mapbox image", res.statusText, mapboxImageUrl);
    return null; // No error thrown since some regions (e.g. Antarctica) don't have a Mapbox image.
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const fileName = `${nanoId()}.png`;

  await client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET!,
      Key: fileName,
      Body: buffer,
      ContentType: "image/png",
    })
  );

  return fileName;
}
