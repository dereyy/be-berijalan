import express from "express";
import cors from "cors";
import "dotenv/config";
import adminRouter from "./routes/admin.router";
import authRouter from "./routes/auth.route";
import counterRouter from "./routes/counter.router";
import queueRouter from "./routes/queue.router";
import systemRouter from "./routes/system.router";
import { MErrorHandler } from "./middlewares/error.middleware";
import {connectRedis} from "./config/redis.config"

const app = express();
connectRedis().catch(console.error);

// Bootstrap: create initial admin if none exists (development helper)
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const bootstrapInitialAdmin = async () => {
  try {
    const count = await prisma.admin.count({ where: { deletedAt: null } });
    if (count === 0) {
      const username = process.env.INIT_ADMIN_USERNAME || "admin";
      const password = process.env.INIT_ADMIN_PASSWORD || "admin123";
      const email = process.env.INIT_ADMIN_EMAIL || "admin@berijalan.com";
      const name = process.env.INIT_ADMIN_NAME || "System Administrator";

      const hashed = await bcrypt.hash(password, 10);
      await prisma.admin.create({
        data: { username, password: hashed, email, name },
      });
      console.log("Initial admin created:", username);
    }
  } catch (err) {
    console.error("Failed to bootstrap admin:", err);
  }
};

bootstrapInitialAdmin();

// Middleware
// Allow credentials so cookies (auth token) can be sent from frontend
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/counters", counterRouter);
app.use("/api/v1/queues", queueRouter);
app.use("/api/v1/system", systemRouter);

// Error handler harus ditempatkan sebelum app.listen
app.use(MErrorHandler);

// Server (read from env when available)
const PORT = +(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log(`PID: ${process.pid}`);
});
