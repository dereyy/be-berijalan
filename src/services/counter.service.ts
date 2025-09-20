import { PrismaClient } from "@prisma/client";
import type { IGlobalResponse } from "../interfaces/global.interface";

const prisma = new PrismaClient();

// Get all counters
export const SGetAllCounters = async (): Promise<IGlobalResponse> => {
  const counters = await prisma.counter.findMany({
    where: { deletedAt: null },
    include: {
      queues: {
        select: {
          id: true,
          number: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    status: true,
    message: "Counters retrieved successfully",
    data: counters,
  };
};

// Get single counter by ID
export const SGetCounterById = async (id: number): Promise<IGlobalResponse> => {
  const counter = await prisma.counter.findUnique({
    where: { id },
    include: {
      queues: {
        select: {
          id: true,
          number: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!counter) {
    throw new Error("Counter not found");
  }

  // Cek apakah counter sudah di-delete
  if (counter.deletedAt) {
    throw new Error("Counter has been deleted");
  }

  return {
    status: true,
    message: "Counter retrieved successfully",
    data: counter,
  };
};

// Create new counter
export const SCreateCounter = async (data: {
  name: string;
  maxQueue?: number;
}): Promise<IGlobalResponse> => {
  // Check if counter name already exists
  const existingCounter = await prisma.counter.findFirst({
    where: { 
      name: data.name,
      deletedAt: null 
    },
  });

  if (existingCounter) {
    throw new Error("Counter name already exists");
  }

  const counter = await prisma.counter.create({
    data: {
      name: data.name,
      maxQueue: data.maxQueue || 99,
    },
  });

  return {
    status: true,
    message: "Counter created successfully",
    data: {
      id: counter.id,
      name: counter.name,
      currentQueue: counter.currentQueue,
      maxQueue: counter.maxQueue,
      isActive: counter.isActive,
      createdAt: counter.createdAt,
    },
  };
};

// Update counter
export const SUpdateCounter = async (
  id: number,
  data: {
    name?: string;
    maxQueue?: number;
    currentQueue?: number;
  }
): Promise<IGlobalResponse> => {
  // Check if counter exists
  const existingCounter = await prisma.counter.findFirst({
    where: { 
      id,
      deletedAt: null 
    },
  });

  if (!existingCounter) {
    throw new Error("Counter not found");
  }

  // Check if name already exists (if updating name)
  if (data.name && data.name !== existingCounter.name) {
    const existingName = await prisma.counter.findFirst({
      where: { 
        name: data.name,
        deletedAt: null,
        id: { not: id }
      },
    });

    if (existingName) {
      throw new Error("Counter name already exists");
    }
  }

  const counter = await prisma.counter.update({
    where: { id },
    data,
  });

  return {
    status: true,
    message: "Counter updated successfully",
    data: {
      id: counter.id,
      name: counter.name,
      currentQueue: counter.currentQueue,
      maxQueue: counter.maxQueue,
      isActive: counter.isActive,
      updatedAt: counter.updatedAt,
    },
  };
};

// Update counter status
export const SUpdateCounterStatus = async (
  id: number,
  status: 'active' | 'inactive' | 'disable'
): Promise<IGlobalResponse> => {
  // Check if counter exists
  const existingCounter = await prisma.counter.findFirst({
    where: { 
      id,
      deletedAt: null 
    },
  });

  if (!existingCounter) {
    throw new Error("Counter not found");
  }

  let updateData: any = {};

  switch (status) {
    case 'active':
      updateData.isActive = true;
      break;
    case 'inactive':
      updateData.isActive = false;
      break;
    case 'disable':
      updateData.deletedAt = new Date();
      break;
  }

  const counter = await prisma.counter.update({
    where: { id },
    data: updateData,
  });

  return {
    status: true,
    message: `Counter ${status === 'disable' ? 'disabled' : status === 'active' ? 'activated' : 'deactivated'} successfully`,
    data: {
      id: counter.id,
      name: counter.name,
      isActive: counter.isActive,
      deletedAt: counter.deletedAt,
    },
  };
};

// Delete counter (soft delete)
export const SDeleteCounter = async (id: number): Promise<IGlobalResponse> => {
  // Check if counter exists (termasuk yang sudah di-delete)
  const existingCounter = await prisma.counter.findUnique({
    where: { id },
  });

  if (!existingCounter) {
    throw new Error("Counter not found");
  }

  // Cek apakah sudah di-delete sebelumnya
  if (existingCounter.deletedAt) {
    throw new Error("Counter already deleted");
  }

  // Soft delete counter
  await prisma.counter.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return {
    status: true,
    message: "Counter deleted successfully",
  };
};