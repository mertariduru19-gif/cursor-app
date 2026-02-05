import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../utils/appError";

export const validate =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return next(new AppError("Validation error", 400, result.error.flatten()));
    }

    req.body = result.data.body ?? req.body;
    req.params = (result.data.params ?? req.params) as typeof req.params;
    req.query = (result.data.query ?? req.query) as typeof req.query;

    return next();
  };
