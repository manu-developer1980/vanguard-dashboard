import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION || "us-east-1";
const endpoint = process.env.AWS_ENDPOINT || "http://localhost:443";

export const s3Client = new S3Client({
  region: region,
  endpoint: endpoint,
  // Forzamos el estilo de ruta (http://localhost:4566/bucket-name) necesario para LocalStack
  forcePathStyle: true, 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "mock-key",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "mock-secret",
  },
});