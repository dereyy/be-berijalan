import { Router } from "express";
import { CCreateAdmin, CUpdateAdmin, CDeleteAdmin } from "../controllers/admin.controller";
import { MValidate, MValidateParams } from "../middlewares/validation.middleware";
import { MAuthenticate } from "../middlewares/auth.middleware";
import { createAdminSchema, updateAdminSchema, idParamSchema } from "../schemas/auth.schema";
import { CGetAllAdmin } from "../controllers/admin.controller";

const router = Router();

// Protected Admin endpoints (semua perlu authentication)
router.get("/", MAuthenticate, CGetAllAdmin);
router.post("/create", MAuthenticate, MValidate(createAdminSchema), CCreateAdmin);
router.put("/:id", MAuthenticate, MValidateParams(idParamSchema), MValidate(updateAdminSchema), CUpdateAdmin);
router.delete("/:id", MAuthenticate, MValidateParams(idParamSchema), CDeleteAdmin);

export default router;