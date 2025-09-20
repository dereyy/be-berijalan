import { PrismaClient } from "@prisma/client";
import type { IGlobalResponse } from "../interfaces/global.interface";

const prisma = new PrismaClient();

// Get all queues
export const SGetAllQueues = async (): Promise<IGlobalResponse> => {
  const queues = await prisma.queue.findMany({
    include: {
      counter: {
        select: {
          id: true,
          name: true,
          maxQueue: true,
          isActive: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    status: true,
    message: "Queues retrieved successfully",
    data: queues,
  };
};

// Get single queue by ID
export const SGetQueueById = async (id: number): Promise<IGlobalResponse> => {
  const queue = await prisma.queue.findUnique({
    where: { id },
    include: {
      counter: {
        select: {
          id: true,
          name: true,
          maxQueue: true,
          isActive: true,
        },
      },
    },
  });

  if (!queue) {
    throw new Error("Queue not found");
  }

  return {
    status: true,
    message: "Queue retrieved successfully",
    data: queue,
  };
};

// Create new queue
export const SCreateQueue = async (data: {
  number: number;
  counterId: number;
  status?: string;
}): Promise<IGlobalResponse> => {
  // Check if counter exists
  const counter = await prisma.counter.findUnique({
    where: { id: data.counterId },
  });

  if (!counter) {
    throw new Error("Counter not found");
  }

  // Check if counter is deleted
  if (counter.deletedAt) {
    throw new Error("Counter has been deleted");
  }

  // Check if counter is active
  if (!counter.isActive) {
    throw new Error("Counter is inactive");
  }

  // Check if queue number already exists for this counter
  const existingQueue = await prisma.queue.findFirst({
    where: {
      number: data.number,
      counterId: data.counterId,
    },
  });

  if (existingQueue) {
    throw new Error("Queue number already exists for this counter");
  }

  // Check if current queue count exceeds max queue
  const queueCount = await prisma.queue.count({
    where: {
      counterId: data.counterId,
      status: { in: ['claimed', 'called'] },
    },
  });

  if (queueCount >= counter.maxQueue) {
    throw new Error("Counter has reached maximum queue capacity");
  }

  const queue = await prisma.queue.create({
    data: {
      number: data.number,
      counterId: data.counterId,
      status: data.status || 'claimed',
    },
    include: {
      counter: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Update counter current queue count
  await prisma.counter.update({
    where: { id: data.counterId },
    data: {
      currentQueue: {
        increment: 1,
      },
    },
  });

  return {
    status: true,
    message: "Queue created successfully",
    data: queue,
  };
};

// Update queue
export const SUpdateQueue = async (
  id: number,
  data: {
    number?: number;
    status?: string;
    counterId?: number;
  }
): Promise<IGlobalResponse> => {
  // Check if queue exists
  const existingQueue = await prisma.queue.findUnique({
    where: { id },
  });

  if (!existingQueue) {
    throw new Error("Queue not found");
  }

  // If updating counterId, check if new counter exists and is active
  if (data.counterId && data.counterId !== existingQueue.counterId) {
    const counter = await prisma.counter.findFirst({
      where: { 
        id: data.counterId,
        deletedAt: null,
        isActive: true
      },
    });

    if (!counter) {
      throw new Error("Target counter not found or inactive");
    }
  }

  // If updating number, check if it already exists for the target counter
  if (data.number) {
    const targetCounterId = data.counterId || existingQueue.counterId;
    const existingNumber = await prisma.queue.findFirst({
      where: {
        number: data.number,
        counterId: targetCounterId,
        id: { not: id },
      },
    });

    if (existingNumber) {
      throw new Error("Queue number already exists for this counter");
    }
  }

  const queue = await prisma.queue.update({
    where: { id },
    data,
    include: {
      counter: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return {
    status: true,
    message: "Queue updated successfully",
    data: queue,
  };
};

// Update queue status only
export const SUpdateQueueStatus = async (
  id: number,
  status: string
): Promise<IGlobalResponse> => {
  // Check if queue exists
  const existingQueue = await prisma.queue.findUnique({
    where: { id },
  });

  if (!existingQueue) {
    throw new Error("Queue not found");
  }

  const queue = await prisma.queue.update({
    where: { id },
    data: { status },
    include: {
      counter: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return {
    status: true,
    message: "Queue status updated successfully",
    data: queue,
  };
};

// Delete queue
export const SDeleteQueue = async (id: number): Promise<IGlobalResponse> => {
  // Check if queue exists
  const existingQueue = await prisma.queue.findUnique({
    where: { id },
  });

  if (!existingQueue) {
    throw new Error("Queue not found");
  }

  // Delete queue
  await prisma.queue.delete({
    where: { id },
  });

  // Update counter current queue count if queue was active
  if (['claimed', 'called'].includes(existingQueue.status)) {
    await prisma.counter.update({
      where: { id: existingQueue.counterId },
      data: {
        currentQueue: {
          decrement: 1,
        },
      },
    });
  }

  return {
    status: true,
    message: "Queue deleted successfully",
  };
};