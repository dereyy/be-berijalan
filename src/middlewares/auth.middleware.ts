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
    // Try to get token from Authorization header first
    const authHeader = req.headers.authorization;
    let token: string | undefined = undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // If no Authorization header, try to read token from Cookie header (httpOnly cookie)
    if (!token && req.headers.cookie) {
      // cookie header format: key1=val1; key2=val2
      const cookies = req.headers.cookie.split(";").map((c) => c.trim());
      for (const c of cookies) {
        const idx = c.indexOf("=");
        if (idx > -1) {
          const k = c.substring(0, idx).trim();
          const v = c.substring(idx + 1).trim();
          if (k === "token") {
            try {
              token = decodeURIComponent(v);
            } catch {
              token = v;
            }
            break;
          }
        }
      }
    }

    if (!token) {
      // no token found
      const msg = "No auth token provided";
      console.warn("MAuthenticate: no token found. authHeader:", req.headers.authorization, "cookie:", req.headers.cookie);
      throw new Error(msg);
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
    // Jika terjadi error selama proses otentikasi, kirim error asli ke handler utama (lebih informatif)
    console.error("MAuthenticate error:", (error as Error).message);
    next(error instanceof Error ? error : new Error(String(error)));
  }
};