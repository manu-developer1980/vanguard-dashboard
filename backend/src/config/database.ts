import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';

// Cargamos las variables de entorno
dotenv.config();

// 1. Creamos un pool de conexiones clásico usando la URL del .env
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// 2. Instanciamos el adaptador oficial de Prisma 7 para PostgreSQL
const adapter = new PrismaPg(pool);

// 3. Le pasamos el adaptador al constructor. ¡Esto desactiva el modo Edge/Wasm!
const prisma = new PrismaClient({
  adapter: adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;