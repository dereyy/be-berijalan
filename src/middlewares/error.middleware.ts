import type { NextFunction } from "express";
import type { Request, Response } from "express";
import type { IGlobalResponse } from "../interfaces/global.interface.js";

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
    if (err.message.includes("not found")) {
      statusCode = 404;
    } else if (err.message.includes("already exists") || err.message.includes("duplicate")) {
      statusCode = 409;
    } else if (err.message.includes("Invalid credentials") || err.message.includes("unauthorized")) {
      statusCode = 401;
    } else if (err.message.includes("forbidden")) {
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