import express, { Request, Response } from 'express';
import prisma from './config/database.js';
import tenantRoutes from './routes/tenantRoutes.js';

const app = express();

// Middleware para que el servidor entienda payloads en formato JSON
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Endpoint de salud (Health Check) para validar que el servidor responde
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.use("/api/v1/tenants", tenantRoutes);

// Función asíncrona para arrancar la base de datos y el servidor en el orden correcto
async function startServer() {
  try {
    // Intentamos conectar a la base de datos usando Prisma 7
    await prisma.$connect();
    console.log('🔌 Database connection successfully established.');

    // Levantamos Express una vez que la base de datos está lista
    app.listen(PORT, () => {
      console.log(`🚀 Vanguard Core Engine running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start the server due to database connection error:', error);
    process.exit(1); // Cerramos el proceso con código de fallo si no hay base de datos
  }
}

// Encendemos el motor
startServer();