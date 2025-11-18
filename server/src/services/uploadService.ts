import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";

const REGION = process.env.S3_REGION || "";
const BUCKET = process.env.S3_BUCKET || "";
const ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "";
const SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "";

function assertConfig() {
  if (!REGION || !BUCKET || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    throw new Error("S3 configuration missing. Set S3_REGION, S3_BUCKET, and credentials in env");
  }
}

const s3 = new S3Client({
  region: REGION,
  credentials: ACCESS_KEY_ID && SECRET_ACCESS_KEY ? { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY } : undefined,
});

export async function getSignedUploadUrl(params: { fileName: string; fileType: string; folder?: string }) {
  assertConfig();
  const ext = params.fileName.includes(".") ? params.fileName.split(".").pop() : undefined;
  const key = `${params.folder || "uploads"}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext ? "." + ext : ""}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: params.fileType,
    ACL: "public-read",
  } as any);
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
  const fileUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  return { uploadUrl, fileUrl, key };
}
