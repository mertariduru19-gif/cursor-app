import { Request, Response } from "express";
import { getProfile } from "../services/user.service";
import { AppError } from "../utils/appError";
import { asyncHandler } from "../utils/asyncHandler";

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const profile = await getProfile(req.user.id);
  res.status(200).json(profile);
});
