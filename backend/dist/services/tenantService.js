"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantService = void 0;
const database_js_1 = __importDefault(require("../config/database.js"));
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.tenantService = {
    async registerTenant(input) {
        const { companyName, adminEmail, adminPassword } = input;
        const existingUser = await database_js_1.default.user.findUnique({
            where: {
                email: adminEmail
            }
        });
        if (existingUser) {
            throw new Error('User already exists');
        }
        const hashedPassword = await bcrypt_1.default.hash(adminPassword, 10);
        return await database_js_1.default.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: companyName
                }
            });
            const adminUser = await tx.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    tenantId: tenant.id
                }
            });
            return { tenant, adminUser };
        });
    }
};
