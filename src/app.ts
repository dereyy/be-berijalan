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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/auth", adminRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/counters", counterRouter);
app.use("/api/v1/queues", queueRouter);
app.use("/api/v1/system", systemRouter);

// Error handler harus ditempatkan sebelum app.listen
app.use(MErrorHandler);

// Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server is running on http://localhost:3000");
});
