import { Request, Response, NextFunction } from "express";
import { UVerifyToken } from "../utils/jwt.util";

/**
 * Middleware untuk otentikasi permintaan (request).
 * Memverifikasi Bearer Token JWT dari header Authorization.
 * Jika valid, data admin dari token akan ditambahkan ke `req.admin`.
 */
export const MAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    // Periksa apakah header authorization ada dan menggunakan skema "Bearer"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorize!");
    }

    // Ambil token dari header (setelah kata "Bearer ")
    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new Error("Unauthorize!");
    }

    // Verifikasi token
    const decoded = await UVerifyToken(token);

    // Type assertion untuk payload yang sudah diverifikasi
    const adminPayload = decoded as { id: number; username: string };

    // Tambahkan payload yang sudah didekode ke objek request
    // agar bisa diakses oleh handler selanjutnya
    req.admin = {
      id: adminPayload.id,
      username: adminPayload.username
    };

    // Lanjutkan ke middleware atau handler berikutnya
    next();
  } catch (error) {
    // Jika terjadi error selama proses otentikasi, kirim error ke handler utama
    next(new Error("Unauthorize!"));
  }
};