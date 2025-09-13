import express from "express";
import cors from "cors";
import adminRouter from "./routes/admin.router";
import authRouter from "./routes/auth.route";
import { MErrorHandler } from "./middlewares/error.middleware";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/auth", adminRouter);

// Error handler harus ditempatkan sebelum app.listen
app.use(MErrorHandler);

// Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server is running on http://localhost:3000");
});
