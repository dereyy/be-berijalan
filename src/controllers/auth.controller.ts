import type { Request, Response, NextFunction } from "express";
import { SLogin } from "../services/auth.service";
import { SCreateAdmin } from "../services/admin.service";
import { PrismaClient } from "@prisma/client";

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

    // Return the login result (including token) so frontend can store it client-side
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const CCreateFirstAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, password, email, name } = req.body;

    // Basic validation
    if (!username || !password || !email || !name) {
      res.status(400).json({ status: false, message: "All fields are required" });
      return;
    }

    const prisma = new PrismaClient();
    const count = await prisma.admin.count({ where: { deletedAt: null } });

    if (count > 0) {
      res.status(403).json({ status: false, message: "Admin already exists" });
      return;
    }

    const result = await SCreateAdmin({ username, password, email, name });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
