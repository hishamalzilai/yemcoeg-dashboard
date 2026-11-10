import { S3Client, PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const R2_ENDPOINT = process.env.R2_ENDPOINT || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

let s3Client: S3Client | null = null;

if (R2_ENDPOINT && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

export async function uploadImage(file: File): Promise<string | null> {
  if (!s3Client) {
    console.warn("R2 is not configured. Skipping upload.");
    return null; // For local development without R2
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Validate MIME type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error("Invalid file type. Only JPG, PNG, WEBP are allowed.");
    }
    
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File too large. Max 5MB.");
    }

    const extension = file.type.split('/')[1];
    const fileName = `${uuidv4()}.${extension}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    return `${R2_PUBLIC_URL}/${fileName}`;
  } catch (error) {
    console.error("Error uploading to R2:", error);
    return null;
  }
}

/** Deletes images previously returned by uploadImage. Returns how many were deleted; never throws. */
export async function deleteImages(urls: string[]): Promise<number> {
  if (!s3Client || urls.length === 0) return 0;

  const prefix = `${R2_PUBLIC_URL}/`;
  const keys = urls
    .filter((u) => R2_PUBLIC_URL && u.startsWith(prefix))
    .map((u) => u.slice(prefix.length))
    .filter(Boolean);

  let deleted = 0;
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000);
    try {
      const res = await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: R2_BUCKET_NAME,
          Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
        })
      );
      deleted += batch.length - (res.Errors?.length ?? 0);
    } catch (error) {
      console.error("Error deleting images from R2:", error);
    }
  }
  return deleted;
}
