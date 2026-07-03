import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

export async function createUploadUrl(key: string, contentType: string): Promise<string | null> {
  if (!client) return null;
  return getSignedUrl(client, new PutObjectCommand({ Bucket: S3_BUCKET!, Key: key, ContentType: contentType }), {
    expiresIn: 600,
  });
}

export async function deleteFromStorage(key: string): Promise<void> {
  if (!client) return;
  await client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET!, Key: key }));
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
