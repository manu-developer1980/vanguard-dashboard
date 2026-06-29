import { Router } from "express";
import { tenantController
 } from "@/controllers/tenantController";

 const router = Router();

 router.post("/register", tenantController.register);

 export default router;