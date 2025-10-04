import type { NextFunction } from "express";
import type { Request, Response } from "express";
import type { IGlobalResponse } from "../interfaces/global.interface";

export const MErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error("Error:", err);

  const isDevelopment = process.env.NODE_ENV === "development";

  if (err instanceof Error) {
    const response: IGlobalResponse = {
      status: false,
      message: err.message,
    };

    const errorObj: any = {
      message: err.message,
    };

    if (err.name) {
      errorObj.name = err.name;
    }

    if (isDevelopment && err.stack) {
      errorObj.detail = err.stack;
    }

    response.error = errorObj;

    // Tentukan status code berdasarkan jenis error
    let statusCode = 400;
    const msg = err.message ? String(err.message).toLowerCase() : '';
    if (msg.includes("not found")) {
      statusCode = 404;
    } else if (msg.includes("already exists") || msg.includes("duplicate")) {
      statusCode = 409;
    } else if (
      msg.includes("invalid credentials") ||
      msg.includes("unauthor") ||
      msg.includes("invalid token") ||
      msg.includes("token expired")
    ) {
      statusCode = 401;
    } else if (msg.includes("forbidden")) {
      statusCode = 403;
    }

    res.status(statusCode).json(response);
  } else {
    const response: IGlobalResponse = {
      status: false,
      message: "An unexpected error occurred",
      error: {
        message: "Internal server error",
        ...(isDevelopment && {
          detail: err.stack,
        }),
      },
    };

    res.status(500).json(response);
  }
};