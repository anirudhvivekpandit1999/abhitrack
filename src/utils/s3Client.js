import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  credentials: {
    accessKeyId: import.meta.env.VITE_E2E_ACCESS_KEY || '',
    secretAccessKey: import.meta.env.VITE_E2E_SECRET_KEY || '',
  },
  endpoint: import.meta.env.VITE_E2E_ENDPOINT || 'https://objectstore.e2enetworks.net',
  region: 'us-east-1',
  forcePathStyle: true,
});

export const BUCKET_NAME = import.meta.env.VITE_E2E_BUCKET_NAME || 'abhitech-pmt';
export const PUBLIC_URL = import.meta.env.VITE_E2E_PUBLIC_URL || 'https://abhitech-pmt.objectstore.e2enetworks.net';
