Plan de Desarrollo Multi-tenant: Vanguard Core Engine
Este documento sirve como guía de continuación para el entorno de desarrollo TRAE IDE. Contiene el estado actual de la arquitectura de capas para el módulo de Tenants y los bloques de código listos para su despliegue y pruebas.
1. Capa de Datos: Servicio
Ruta del archivo: src/services/tenantService.ts
Este componente gestiona las operaciones moleculares sobre la base de datos de PostgreSQL utilizando transacciones atómicas ($transaction) para garantizar que el Tenant y su Administrador se creen en conjunto.
import prisma from '../config/database.js';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

interface RegisterTenantInput {
  companyName: string;
  adminEmail: string;
  adminPassword: string;
}

export const tenantService = {
  async registerTenant(input: RegisterTenantInput) {
    const { companyName, adminEmail, adminPassword } = input;

    // Control de seguridad: Verificar duplicados
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Encriptación de credenciales
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Transacción atómica en PostgreSQL
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Inserción del Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: companyName,
        },
      });

      // Inserción del Usuario Administrador vinculado
      const adminUser = await tx.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          tenantId: tenant.id,
        },
      });

      return { tenant, adminUser };
    });
  },
};


2. Capa de Control: Controlador
Ruta del archivo: src/controllers/tenantController.ts
El controlador se encarga del manejo del ciclo de vida de la petición HTTP (Request/Response), las validaciones de entrada en el cuerpo de la petición (req.body) y la gestión de códigos de estado HTTP.
import { Request, Response } from 'express';
import { tenantService } from '../services/tenantService.js';

export const tenantController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { companyName, adminEmail, adminPassword } = req.body;

      // Validación de campos requeridos
      if (!companyName || !adminEmail || !adminPassword) {
        res.status(400).json({ 
          success: false, 
          message: 'All fields (companyName, adminEmail, adminPassword) are required.' 
        });
        return;
      }

      // Ejecución del servicio
      const result = await tenantService.registerTenant({
        companyName,
        adminEmail,
        adminPassword,
      });

      // Respuesta exitosa (201 Created)
      res.status(201).json({
        success: true,
        message: 'Tenant and administrator successfully registered.',
        data: {
          tenantId: result.tenant.id,
          companyName: result.tenant.name,
          admin: {
            id: result.adminUser.id,
            email: result.adminUser.email,
            role: result.adminUser.role,
          },
        },
      });
    } catch (error: any) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        res.status(400).json({ success: false, message: 'This email is already registered.' });
        return;
      }

      console.error('Error in tenant registration:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },
};


3. Capa de Comunicación: Enrutador
Ruta del archivo: src/routes/tenantRoutes.ts
Define los puntos de entrada específicos (endpoints) expuestos hacia los clientes de la API.
import { Router } from 'express';
import { tenantController } from '../controllers/tenantController.js';

const router = Router();

// Endpoint de registro
router.post('/register', tenantController.register);

export default router;


Inyección global (Ruta base en app.ts)
Para activar el módulo de rutas dentro de la aplicación Express:
import tenantRoutes from './routes/tenantRoutes.js';

// Middleware intermedio
app.use('/api/v1/tenants', tenantRoutes);


4. Próximos pasos en TRAE IDE
Levantar la infraestructura local desde la raíz mediante el comando: docker compose up -d.
Ejecutar el servidor de desarrollo del backend: npm run dev o npm run build para comprobar que el compilador se mantiene en verde.
Realizar una petición POST de prueba hacia http://localhost:3000/api/v1/tenants/register utilizando un cliente HTTP integrado en el IDE o externo.
