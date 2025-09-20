import { Router } from "express";
import {
  CGetAllCounters,
  CGetCounterById,
  CCreateCounter,
  CUpdateCounter,
  CUpdateCounterStatus,
  CDeleteCounter,
} from "../controllers/counter.controller";
import { MValidate, MValidateParams } from "../middlewares/validation.middleware";
import { MAuthenticate } from "../middlewares/auth.middleware";
import {
  createCounterSchema,
  updateCounterSchema,
  updateCounterStatusSchema,
  idParamSchema,
} from "../schemas/counter.schema";

const counterRouter = Router();

// Public endpoints (tidak perlu authentication)
// Get all counters
counterRouter.get("/", CGetAllCounters);

// Get single counter by ID
counterRouter.get("/:id", MValidateParams(idParamSchema), CGetCounterById);

// Protected endpoints (perlu authentication)
// Create new counter
counterRouter.post("/", MAuthenticate, MValidate(createCounterSchema), CCreateCounter);

// Update counter
counterRouter.put("/:id", MAuthenticate, MValidateParams(idParamSchema), MValidate(updateCounterSchema), CUpdateCounter);

// Update counter status
counterRouter.patch("/:id/status", MAuthenticate, MValidateParams(idParamSchema), MValidate(updateCounterStatusSchema), CUpdateCounterStatus);

// Delete counter
counterRouter.delete("/:id", MAuthenticate, MValidateParams(idParamSchema), CDeleteCounter);

export default counterRouter;