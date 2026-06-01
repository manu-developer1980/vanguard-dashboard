import prisma from '../config/database.js';
import bcrypt from 'bcrypt';

interface RegisterTenantInput {
    companyName: string;
    adminEmail: string;
    adminPassword: string;
}

export const tenantService =  {
  async registerTenant (input:RegisterTenantInput){
    const {companyName, adminEmail, adminPassword} = input;
  }
}
