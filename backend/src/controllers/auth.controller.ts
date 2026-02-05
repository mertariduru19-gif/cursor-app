import { Request, Response } from "express";
import { register, login } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await register(req.body);
  res.status(201).json(result);
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await login(req.body);
  res.status(200).json(result);
});
