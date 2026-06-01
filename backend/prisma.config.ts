import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// 👇 Esto lee tu archivo .env y lo inyecta en process.env
dotenv.config();
export default defineConfig({
  // Le indicamos dónde está el esquema físicamente
  schema: './prisma/schema.prisma',
  // Aquí le pasamos la conexión que leerá de tu archivo .env
  datasource: {
    url: process.env.DATABASE_URL,
  },
});