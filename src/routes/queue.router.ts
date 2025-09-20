import { Router } from "express";
import {
  CGetAllQueues,
  CGetQueueById,
  CCreateQueue,
  CUpdateQueue,
  CUpdateQueueStatus,
  CDeleteQueue,
  CClaimQueue,
  CReleaseQueue,
  CGetCurrentStatus,
  CNextQueue,
  CSkipQueue,
  CResetQueue,
} from "../controllers/queue.controller";
import { MValidate, MValidateParams } from "../middlewares/validation.middleware";
import { MAuthenticate } from "../middlewares/auth.middleware";
import {
  createQueueSchema,
  updateQueueSchema,
  updateQueueStatusSchema,
  idParamSchema,
  counterIdParamSchema,
  resetQueueSchema,
} from "../schemas/queue.schema";

const queueRouter = Router();

// =====================
// QUEUE MANAGEMENT ENDPOINTS (PUBLIC)
// =====================

// Claim queue automatically (no auth)
queueRouter.post("/claim", CClaimQueue);

// Release queue (no auth)
queueRouter.patch("/release/:id", MValidateParams(idParamSchema), CReleaseQueue);

// Get current status of all counters (no auth)
queueRouter.get("/current", CGetCurrentStatus);

// =====================
// QUEUE MANAGEMENT ENDPOINTS (PROTECTED)
// =====================

// Call next queue for specific counter (with auth)
queueRouter.post("/next/:counter_id", MAuthenticate, MValidateParams(counterIdParamSchema), CNextQueue);

// Skip current queue and call next (with auth)
queueRouter.post("/skip/:counter_id", MAuthenticate, MValidateParams(counterIdParamSchema), CSkipQueue);

// Reset queues (with auth)
queueRouter.post("/reset", MAuthenticate, MValidate(resetQueueSchema), CResetQueue);

// =====================
// ORIGINAL CRUD ENDPOINTS
// =====================

// Public endpoints (tidak perlu authentication)
// Get all queues
queueRouter.get("/", CGetAllQueues);

// Get single queue by ID
queueRouter.get("/:id", MValidateParams(idParamSchema), CGetQueueById);

// Protected endpoints (perlu authentication)
// Create new queue
queueRouter.post("/", MAuthenticate, MValidate(createQueueSchema), CCreateQueue);

// Update queue
queueRouter.put("/:id", MAuthenticate, MValidateParams(idParamSchema), MValidate(updateQueueSchema), CUpdateQueue);

// Update queue status
queueRouter.patch("/:id/status", MAuthenticate, MValidateParams(idParamSchema), MValidate(updateQueueStatusSchema), CUpdateQueueStatus);

// Delete queue
queueRouter.delete("/:id", MAuthenticate, MValidateParams(idParamSchema), CDeleteQueue);

export default queueRouter;