import type { Request, Response, NextFunction } from "express";
import fs from "fs";

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const status = err instanceof Error ? 400 : 500;
  const message = err instanceof Error ? err.message : "Internal server error.";

  console.error("[Backend Error]", err);
  fs.appendFileSync("error.log", `[Backend Error] ${new Date().toISOString()} ${req.method} ${req.url} - ${message}\n${err instanceof Error ? err.stack : ""}\n`);

  res.status(status).json({
    success: false,
    message,
  });

  next();
};
