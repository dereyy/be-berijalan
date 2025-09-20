import type { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Reset/cleanup all data for testing
export const CResetData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Delete all queues first (foreign key constraint)
    await prisma.queue.deleteMany();
    
    // Delete all counters
    await prisma.counter.deleteMany();
    
    // Reset auto increment (PostgreSQL specific)
    await prisma.$executeRaw`ALTER SEQUENCE "Counter_id_seq" RESTART WITH 1`;
    await prisma.$executeRaw`ALTER SEQUENCE "Queue_id_seq" RESTART WITH 1`;
    
    res.status(200).json({
      status: true,
      message: "All data has been reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get system status
export const CGetStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const counterCount = await prisma.counter.count();
    const queueCount = await prisma.queue.count();
    const activeCounters = await prisma.counter.count({
      where: { isActive: true, deletedAt: null }
    });
    
    res.status(200).json({
      status: true,
      message: "System status retrieved successfully",
      data: {
        totalCounters: counterCount,
        activeCounters: activeCounters,
        totalQueues: queueCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};