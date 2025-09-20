import type { Request, Response, NextFunction } from "express";
import {
  SGetAllQueues,
  SGetQueueById,
  SCreateQueue,
  SUpdateQueue,
  SUpdateQueueStatus,
  SDeleteQueue,
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