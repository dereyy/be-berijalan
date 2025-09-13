import { Router } from "express";
import { CLogin } from "../controllers/auth.controller";

const router = Router();

router.post("/login", CLogin);

export default router;
