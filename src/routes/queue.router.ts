import { Router } from "express";
import {
  CGetAllQueues,
  CGetQueueById,
  CCreateQueue,
  CUpdateQueue,
  CUpdateQueueStatus,
  CDeleteQueue,
} from "../controllers/queue.controller";
import { MValidate, MValidateParams } from "../middlewares/validation.middleware";
import {
  createQueueSchema,
  updateQueueSchema,
  updateQueueStatusSchema,
  idParamSchema,
} from "../schemas/queue.schema";

const queueRouter = Router();

// Get all queues
queueRouter.get("/", CGetAllQueues);

// Get single queue by ID
queueRouter.get("/:id", MValidateParams(idParamSchema), CGetQueueById);

// Create new queue
queueRouter.post("/", MValidate(createQueueSchema), CCreateQueue);

// Update queue
queueRouter.put("/:id", MValidateParams(idParamSchema), MValidate(updateQueueSchema), CUpdateQueue);

// Update queue status
queueRouter.patch("/:id/status", MValidateParams(idParamSchema), MValidate(updateQueueStatusSchema), CUpdateQueueStatus);

// Delete queue
queueRouter.delete("/:id", MValidateParams(idParamSchema), CDeleteQueue);

export default queueRouter;