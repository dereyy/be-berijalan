import type { Request, Response, NextFunction } from "express";
import {
  SGetAllQueues,
  SGetQueueById,
  SCreateQueue,
  SUpdateQueue,
  SUpdateQueueStatus,
  SDeleteQueue,
  SClaimQueue,
  SReleaseQueue,
  SGetCurrentStatus,
  SNextQueue,
  SSkipQueue,
  SResetQueue,
} from "../services/queue.service";

// Get all queues
export const CGetAllQueues = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await SGetAllQueues();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Get single queue by ID
export const CGetQueueById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        status: false,
        message: "ID is required"
      });
      return;
    }
    
    const result = await SGetQueueById(parseInt(id));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Create new queue
export const CCreateQueue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { number, counterId, status } = req.body;
    const result = await SCreateQueue({ number, counterId, status });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// Update queue
export const CUpdateQueue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { number, status, counterId } = req.body;
    
    if (!id) {
      res.status(400).json({
        status: false,
        message: "ID is required"
      });
      return;
    }
    
    const result = await SUpdateQueue(parseInt(id), { number, status, counterId });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Update queue status
export const CUpdateQueueStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!id) {
      res.status(400).json({
        status: false,
        message: "ID is required"
      });
      return;
    }
    
    const result = await SUpdateQueueStatus(parseInt(id), status);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Delete queue
export const CDeleteQueue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        status: false,
        message: "ID is required"
      });
      return;
    }
    
    const result = await SDeleteQueue(parseInt(id));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// =====================
// NEW QUEUE MANAGEMENT CONTROLLERS
// =====================

// Claim queue automatically
export const CClaimQueue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await SClaimQueue();
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// Release queue
export const CReleaseQueue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        status: false,
        message: "Queue ID is required"
      });
      return;
    }
    
    const result = await SReleaseQueue(parseInt(id));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Get current status of all counters
export const CGetCurrentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await SGetCurrentStatus();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Call next queue for specific counter
export const CNextQueue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { counter_id } = req.params;
    
    if (!counter_id) {
      res.status(400).json({
        status: false,
        message: "Counter ID is required"
      });
      return;
    }
    
    const result = await SNextQueue(parseInt(counter_id));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Skip current queue and call next
export const CSkipQueue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { counter_id } = req.params;
    
    if (!counter_id) {
      res.status(400).json({
        status: false,
        message: "Counter ID is required"
      });
      return;
    }
    
    const result = await SSkipQueue(parseInt(counter_id));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Reset queues
export const CResetQueue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { counter_id } = req.body;
    
    const result = await SResetQueue(counter_id ? parseInt(counter_id) : undefined);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};