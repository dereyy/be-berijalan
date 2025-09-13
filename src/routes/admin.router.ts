import { Router } from "express";
import { CCreateAdmin, CUpdateAdmin, CDeleteAdmin } from "../controllers/admin.controller.js";
import { MValidate, MValidateParams } from "../middlewares/validation.middleware.js";
import { createAdminSchema, updateAdminSchema, idParamSchema } from "../schemas/auth.schema.js";

const router = Router();

// CRUD Admin endpoints
router.post("/create", MValidate(createAdminSchema), CCreateAdmin);
router.put("/:id", MValidateParams(idParamSchema), MValidate(updateAdminSchema), CUpdateAdmin);
router.delete("/:id", MValidateParams(idParamSchema), CDeleteAdmin);

export default router;