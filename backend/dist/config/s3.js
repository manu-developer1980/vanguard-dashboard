"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const region = process.env.AWS_REGION || "us-east-1";
const endpoint = process.env.AWS_ENDPOINT || "http://localhost:443";
exports.s3Client = new client_s3_1.S3Client({
    region: region,
    endpoint: endpoint,
    // Forzamos el estilo de ruta (http://localhost:4566/bucket-name) necesario para LocalStack
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "mock-key",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "mock-secret",
    },
});
