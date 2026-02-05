import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import { verifyToken } from "../utils/jwt";

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Authorization token missing", 401));
  }

  const token = header.split(" ")[1];
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.userId, role: payload.role };
    return next();
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }
};
