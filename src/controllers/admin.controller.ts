import type { Request, Response, NextFunction } from "express";
import { SCreateAdmin, SUpdateAdmin, SDeleteAdmin } from "../services/admin.service";

export const CCreateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, password, email, name } = req.body;
    const result = await SCreateAdmin({ username, password, email, name });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const CUpdateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, password, email, name } = req.body;
    
    if (!id) {
      res.status(400).json({
        status: false,
        message: "ID is required"
      });
      return;
    }
    
    const result = await SUpdateAdmin(parseInt(id), { username, password, email, name });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const CDeleteAdmin = async (
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
    
    const result = await SDeleteAdmin(parseInt(id));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};