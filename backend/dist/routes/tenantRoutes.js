"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tenantController_1 = require("@/controllers/tenantController");
const router = (0, express_1.Router)();
router.post("/register", tenantController_1.tenantController.register);
exports.default = router;
