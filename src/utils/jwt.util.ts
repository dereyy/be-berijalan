import jwt, { SignOptions } from "jsonwebtoken";
import { Admin } from "@prisma/client";
import { redisClient } from "../config/redis.config"; // Path diasumsikan
import { Request } from "express";
import ms from "ms";

// Mengambil secret key dan masa berlaku token dari environment variables
// dengan nilai default jika tidak ditemukan.
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "1d") as ms.StringValue;

/**
 * Membuat JSON Web Token (JWT) untuk admin dan menyimpannya di Redis.
 * @param admin - Objek admin yang berisi id dan username.
 * @returns String token JWT yang baru dibuat.
 */
export const UGenerateToken = (admin: Partial<Admin>): string => {
  // Membuat token dengan payload berisi id dan username admin
  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    } as SignOptions
  );

  // Membuat kunci unik untuk Redis: token:<adminId>:<signature>
  const key = `token:${admin.id}:${token.split(".")[2]}`;

  // Menyimpan token di Redis dengan masa berlaku (EX = seconds)
  const exSeconds = ms(JWT_EXPIRES_IN) / 1000;
  try {
    console.log("UGenerateToken: storing token key", key, "expiresIn(s)=", exSeconds);
    redisClient.set(key, token, {
      EX: exSeconds,
    });
  } catch (err) {
    console.error("UGenerateToken: failed to store token in redis", err);
  }

  return token;
};

/**
 * Memverifikasi token. Token dianggap valid jika signature-nya benar
 * dan masih tersimpan di Redis.
 * @param token - String token JWT yang akan diverifikasi.
 * @returns Payload dari token jika valid.
 */
export const UVerifyToken = async (token: string) => {
  // Memverifikasi token menggunakan secret key
  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    const e: any = err;
    console.error("UVerifyToken: jwt.verify failed:", e?.message || e);
    throw new Error("Invalid token");
  }

  // Jika payload tidak valid setelah verifikasi (seharusnya jwt.verify sudah throw error)
  if (!payload) {
    throw new Error("Invalid token");
  }

  // Type assertion untuk payload yang sudah diverifikasi
  const adminPayload = payload as { id: number; username: string };

  // Membuat kembali key Redis yang sesuai dengan token
  const key = `token:${adminPayload.id}:${token.split(".")[2]}`;

  // Memeriksa apakah token masih ada di Redis
  const data = await redisClient.get(key);

  // Jika tidak ada di Redis, berarti token sudah di-invalidate (misal: logout) atau expired
  if (!data) {
    console.error("UVerifyToken: token not found in redis for key", key);
    throw new Error("Token expired or invalidated");
  }

  // Jika semua verifikasi berhasil, kembalikan payload
  return payload;
};

/**
 * Menginvalidasi/menghapus token dari Redis untuk proses logout.
 * @param adminId - ID dari admin yang tokennya akan di-invalidate.
 * @param token - String token JWT yang akan di-invalidate.
 * @returns Promise yang resolve dengan hasil operasi delete dari Redis.
 */
export const UInvalidateToken = (
  adminId: number,
  token: string
): Promise<number> => {
  // Membuat key Redis yang akan dihapus
  const key = `token:${adminId}:${token.split(".")[2]}`;

  // Menghapus key dari Redis
  return redisClient.del(key);
};