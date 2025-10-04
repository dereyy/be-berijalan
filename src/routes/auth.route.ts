import { Router } from "express";
import { CLogin, CCreateFirstAdmin } from "../controllers/auth.controller";

const router = Router();

router.post("/create", CCreateFirstAdmin);
router.post("/login", CLogin);

export default router;
