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
import {
  createCounterSchema,
  updateCounterSchema,
  updateCounterStatusSchema,
  idParamSchema,
} from "../schemas/counter.schema";

const counterRouter = Router();

// Get all counters
counterRouter.get("/", CGetAllCounters);

// Get single counter by ID
counterRouter.get("/:id", MValidateParams(idParamSchema), CGetCounterById);

// Create new counter
counterRouter.post("/", MValidate(createCounterSchema), CCreateCounter);

// Update counter
counterRouter.put("/:id", MValidateParams(idParamSchema), MValidate(updateCounterSchema), CUpdateCounter);

// Update counter status
counterRouter.patch("/:id/status", MValidateParams(idParamSchema), MValidate(updateCounterStatusSchema), CUpdateCounterStatus);

// Delete counter
counterRouter.delete("/:id", MValidateParams(idParamSchema), CDeleteCounter);

export default counterRouter;