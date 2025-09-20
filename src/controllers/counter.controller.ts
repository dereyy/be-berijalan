import type { Request, Response, NextFunction } from "express";
import {
  SGetAllCounters,
  SGetCounterById,
  SCreateCounter,
  SUpdateCounter,
  SUpdateCounterStatus,
  SDeleteCounter,
} from "../services/counter.service";

// Get all counters
export const CGetAllCounters = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await SGetAllCounters();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Get single counter by ID
export const CGetCounterById = async (
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
    
    const result = await SGetCounterById(parseInt(id));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Create new counter
export const CCreateCounter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, maxQueue } = req.body;
    const result = await SCreateCounter({ name, maxQueue });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// Update counter
export const CUpdateCounter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, maxQueue, currentQueue } = req.body;
    
    if (!id) {
      res.status(400).json({
        status: false,
        message: "ID is required"
      });
      return;
    }
    
    const result = await SUpdateCounter(parseInt(id), { name, maxQueue, currentQueue });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Update counter status
export const CUpdateCounterStatus = async (
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
    
    const result = await SUpdateCounterStatus(parseInt(id), status);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Delete counter
export const CDeleteCounter = async (
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
    
    const result = await SDeleteCounter(parseInt(id));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};