import type { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const status = err instanceof Error ? 400 : 500;
  const message = err instanceof Error ? err.message : "Internal server error.";

  res.status(status).json({
    success: false,
    message,
  });

  next();
};
