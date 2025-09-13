import type { Request, Response, NextFunction } from "express";
import { SLogin } from "../services/auth.service";

export const CLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      res.status(400).json({
        status: false,
        message: "Username and password are required"
      });
      return;
    }
    
    const result = await SLogin(username, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
