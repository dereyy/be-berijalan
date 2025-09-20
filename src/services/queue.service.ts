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

// =====================
// NEW QUEUE MANAGEMENT SERVICES
// =====================

// Claim queue - Auto assign to counter with smallest queue
export const SClaimQueue = async (): Promise<IGlobalResponse> => {
  // Find active counter with smallest current queue
  const counter = await prisma.counter.findFirst({
    where: {
      deletedAt: null,
      isActive: true,
    },
    orderBy: {
      currentQueue: 'asc',
    },
  });

  if (!counter) {
    throw new Error("No active counters available");
  }

  // Check if counter has reached max capacity
  if (counter.currentQueue >= counter.maxQueue) {
    throw new Error("All counters are at maximum capacity");
  }

  // Get next queue number for this counter
  const lastQueue = await prisma.queue.findFirst({
    where: { counterId: counter.id },
    orderBy: { number: 'desc' },
  });

  const nextNumber = lastQueue ? lastQueue.number + 1 : 1;

  // Create new queue
  const queue = await prisma.queue.create({
    data: {
      number: nextNumber,
      counterId: counter.id,
      status: 'claimed',
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
    where: { id: counter.id },
    data: {
      currentQueue: {
        increment: 1,
      },
    },
  });

  return {
    status: true,
    message: "Queue claimed successfully",
    data: {
      queueNumber: queue.number,
      queueId: queue.id,
      counter: queue.counter,
      status: queue.status,
      createdAt: queue.createdAt,
    },
  };
};

// Release queue - Cancel claimed queue
export const SReleaseQueue = async (queueId: number): Promise<IGlobalResponse> => {
  // Check if queue exists
  const existingQueue = await prisma.queue.findUnique({
    where: { id: queueId },
    include: {
      counter: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!existingQueue) {
    throw new Error("Queue not found");
  }

  // Only allow release if queue is claimed
  if (existingQueue.status !== 'claimed') {
    throw new Error("Only claimed queues can be released");
  }

  // Update queue status to released
  const updatedQueue = await prisma.queue.update({
    where: { id: queueId },
    data: { status: 'released' },
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
    where: { id: existingQueue.counterId },
    data: {
      currentQueue: {
        decrement: 1,
      },
    },
  });

  return {
    status: true,
    message: "Queue released successfully",
    data: {
      queueNumber: updatedQueue.number,
      queueId: updatedQueue.id,
      counter: updatedQueue.counter,
      status: updatedQueue.status,
    },
  };
};

// Get current status of all active counters
export const SGetCurrentStatus = async (): Promise<IGlobalResponse> => {
  const counters = await prisma.counter.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    include: {
      queues: {
        where: {
          status: { in: ['claimed', 'called'] },
        },
        orderBy: {
          createdAt: 'asc',
        },
        take: 1,
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  const statusData = counters.map(counter => ({
    counterId: counter.id,
    counterName: counter.name,
    currentQueue: counter.currentQueue,
    maxQueue: counter.maxQueue,
    isActive: counter.isActive,
    currentQueueNumber: counter.queues[0]?.number || null,
    nextQueueStatus: counter.queues[0]?.status || null,
  }));

  return {
    status: true,
    message: "Current status retrieved successfully",
    data: statusData,
  };
};

// Next queue - Call next customer for specific counter
export const SNextQueue = async (counterId: number): Promise<IGlobalResponse> => {
  // Check if counter exists and is active
  const counter = await prisma.counter.findFirst({
    where: {
      id: counterId,
      deletedAt: null,
      isActive: true,
    },
  });

  if (!counter) {
    throw new Error("Counter not found or inactive");
  }

  // Find oldest claimed queue for this counter
  const nextQueue = await prisma.queue.findFirst({
    where: {
      counterId: counterId,
      status: 'claimed',
    },
    orderBy: {
      createdAt: 'asc',
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

  if (!nextQueue) {
    throw new Error("No claimed queues available for this counter");
  }

  // Update queue status to called
  const calledQueue = await prisma.queue.update({
    where: { id: nextQueue.id },
    data: { status: 'called' },
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
    message: "Next queue called successfully",
    data: {
      queueNumber: calledQueue.number,
      queueId: calledQueue.id,
      counter: calledQueue.counter,
      status: calledQueue.status,
      calledAt: calledQueue.updatedAt,
    },
  };
};

// Skip queue - Skip current called queue and call next
export const SSkipQueue = async (counterId: number): Promise<IGlobalResponse> => {
  // Check if counter exists and is active
  const counter = await prisma.counter.findFirst({
    where: {
      id: counterId,
      deletedAt: null,
      isActive: true,
    },
  });

  if (!counter) {
    throw new Error("Counter not found or inactive");
  }

  // Find current called queue for this counter
  const currentQueue = await prisma.queue.findFirst({
    where: {
      counterId: counterId,
      status: 'called',
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  if (!currentQueue) {
    throw new Error("No called queue found for this counter");
  }

  // Update current queue status to skipped
  await prisma.queue.update({
    where: { id: currentQueue.id },
    data: { status: 'skipped' },
  });

  // Try to call next queue
  const nextQueue = await prisma.queue.findFirst({
    where: {
      counterId: counterId,
      status: 'claimed',
    },
    orderBy: {
      createdAt: 'asc',
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

  let nextQueueData = null;
  if (nextQueue) {
    const calledNext = await prisma.queue.update({
      where: { id: nextQueue.id },
      data: { status: 'called' },
      include: {
        counter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    nextQueueData = {
      queueNumber: calledNext.number,
      queueId: calledNext.id,
      counter: calledNext.counter,
      status: calledNext.status,
    };
  }

  return {
    status: true,
    message: "Queue skipped successfully",
    data: {
      skippedQueue: {
        queueNumber: currentQueue.number,
        queueId: currentQueue.id,
      },
      nextQueue: nextQueueData,
    },
  };
};

// Reset queue - Reset all queues for specific counter or all counters
export const SResetQueue = async (counterId?: number): Promise<IGlobalResponse> => {
  if (counterId) {
    // Reset specific counter
    const counter = await prisma.counter.findFirst({
      where: {
        id: counterId,
        deletedAt: null,
        isActive: true,
      },
    });

    if (!counter) {
      throw new Error("Counter not found or inactive");
    }

    // Update all active queues to reset status
    await prisma.queue.updateMany({
      where: {
        counterId: counterId,
        status: { in: ['claimed', 'called'] },
      },
      data: { status: 'reset' },
    });

    // Reset counter current queue to 0
    await prisma.counter.update({
      where: { id: counterId },
      data: { currentQueue: 0 },
    });

    return {
      status: true,
      message: `Queue reset successfully for counter ${counter.name}`,
    };
  } else {
    // Reset all active counters
    await prisma.queue.updateMany({
      where: {
        status: { in: ['claimed', 'called'] },
      },
      data: { status: 'reset' },
    });

    await prisma.counter.updateMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      data: { currentQueue: 0 },
    });

    return {
      status: true,
      message: "All queues reset successfully",
    };
  }
};