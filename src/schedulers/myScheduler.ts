import { PrismaClient } from "@prisma/client";
import * as cron from "node-cron";

// Inisialisasi Prisma Client untuk interaksi database
const prisma = new PrismaClient();

// Map untuk menyimpan dan mengelola tugas-tugas cron yang sedang berjalan
const jobs = new Map<string, cron.ScheduledTask>();

/**
 * Interface untuk hasil operasi pembersihan.
 */
export interface CleanupResult {
  deletedCount: number;
  message: string;
  timestamp: Date;
}

/**
 * Membuat dan menjadwalkan tugas cron baru.
 * @param expression - String cron (misalnya, "0 2 * * *").
 * @param taskFunction - Fungsi async yang akan dijalankan.
 * @param timezone - Zona waktu untuk jadwal (default: "Asia/Jakarta").
 * @returns instance tugas yang dijadwalkan dari node-cron.
 */
const createCronTask = (
  expression: string,
  taskFunction: () => Promise<void>,
  timezone: string = "Asia/Jakarta"
): cron.ScheduledTask => {
  return cron.schedule(
    expression,
    async () => {
      try {
        await taskFunction();
      } catch (error) {
        console.error("Cron task failed:", error);
      }
    },
    { timezone }
  );
};

/**
 * Menghitung tanggal batas (cutoff) untuk pembersihan data.
 * @param daysOld - Jumlah hari data yang ingin dipertahankan.
 * @returns Objek Date yang merepresentasikan tanggal batas.
 */
const calculateCutoffDate = (daysOld: number): Date => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  return cutoffDate;
};

/**
 * Membersihkan entri antrean (queue) yang lebih lama dari jumlah hari yang ditentukan.
 * @param daysOld - Batas umur data dalam hari yang akan dihapus.
 * @returns Promise yang resolve dengan objek CleanupResult.
 */
export const cleanupExpiredQueues = async (
  daysOld: number = 1
): Promise<CleanupResult> => {
  try {
    const cutoffDate = calculateCutoffDate(daysOld);

    // Menghapus data antrean yang dibuat sebelum tanggal batas
    const deleteResult = await prisma.queue.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate, // lt: less than (kurang dari)
        },
      },
    });

    const deletedCount = deleteResult.count;
    const message = `Successfully cleaned up ${deletedCount} expired queue entries.`;

    console.log(message);

    return {
      deletedCount,
      message,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Error during queue cleanup:", error);
    throw new Error(
      `Queue cleanup failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Menjadwalkan tugas pembersihan antrean (queue) harian.
 */
const scheduleQueueCleanup = (): void => {
  const taskFunction = async () => {
    console.log("Running scheduled queue cleanup...");
    // Menghapus data yang lebih lama dari 1 hari
    const result = await cleanupExpiredQueues(1);
    console.log("Cleanup results:", result);
  };

  // Menjadwalkan tugas untuk berjalan setiap hari jam 2 pagi ("0 2 * * *")
  const task = createCronTask("0 2 * * *", taskFunction);
  jobs.set("queueCleanup", task);

  console.log("Queue cleanup job scheduled: Every day at 02:00 (Asia/Jakarta)");
};

/**
 * Fungsi utama untuk menginisialisasi semua cron job yang dibutuhkan aplikasi.
 */
export const initializeCronJobs = (): void => {
  console.log("Initializing cron jobs...");

  scheduleQueueCleanup();
  // Tambahkan jadwal cron job lain di sini jika ada

  console.log("All cron jobs initialized successfully");
};