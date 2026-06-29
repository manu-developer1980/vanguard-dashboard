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
    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminEmail
      }
    }); 
    if(existingUser){
      throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    return await prisma.$transaction(async (tx) => {
        const tenant =  await tx.tenant.create({
            data:{
                name: companyName
            }
        });
        const adminUser = await tx.user.create(
            {
                data:{
                    email:adminEmail,
                    password:hashedPassword,
                    tenantId:tenant.id
                }
            }
        )

        return {tenant, adminUser}
    })
  }
}