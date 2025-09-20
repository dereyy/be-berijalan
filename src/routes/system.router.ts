import { Router } from "express";
import { CResetData, CGetStatus } from "../controllers/system.controller";

const systemRouter = Router();

// Get system status
systemRouter.get("/status", CGetStatus);

// Reset all data (untuk testing)
systemRouter.post("/reset", CResetData);

export default systemRouter;