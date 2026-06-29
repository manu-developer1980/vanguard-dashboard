import { Request, Response } from 'express';
import {tenantService} from '../services/tenantService.js';

export const tenantController = {
    async register(req:Request, res:Response):Promise<void>{
        try {
            const {companyName, adminEmail, adminPassword} = req.body;
            if(!companyName || !adminEmail || !adminPassword){
                res.status(400).json({
                    message:'All fields are required.'
                });
            return;
            }
            const result = await tenantService.registerTenant({
                companyName,
                adminEmail,
                adminPassword
            });

            res.status(201).json({
                success:true,
                message:'Tenant registered successfully.',
                data:{
                    tenantId: result.tenant.id,
                    companyName: result.tenant.name,
                    admin:{
                        id: result.adminUser.id,
                        email: result.adminUser.email,
                        role: result.adminUser.role
                    }
                }
            });
        }
        catch(error:any){
            if(error.message === "EMAIL_ALREADY_EXISTS"){
                res.status(400).json({
                    success:false,
                    message:'Email already exists.'
                })
                return;
            }
            
            console.error("Error in tenant creation:",error);
            res.status(500).json({
                success:false,
                message:'Internal server error.'
            })
        }
    }
};