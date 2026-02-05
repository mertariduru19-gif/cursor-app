import { Request, Response } from "express";
import {
  createRequest,
  deleteRequest,
  getRequestById,
  listRequests,
  updateRequest,
} from "../services/request.service";
import { AppError } from "../utils/appError";
import { asyncHandler } from "../utils/asyncHandler";

export const listRequestsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const result = await listRequests({
    page: req.query.page as string | undefined,
    pageSize: req.query.pageSize as string | undefined,
    status: req.query.status as any,
    priority: req.query.priority as any,
    search: req.query.search as string | undefined,
    sortBy: req.query.sortBy as string | undefined,
    sortOrder: req.query.sortOrder as string | undefined,
    userId: req.user.id,
    role: req.user.role,
  });

  res.status(200).json(result);
});

export const getRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const request = await getRequestById(req.params.id, req.user.id, req.user.role);
  res.status(200).json(request);
});

export const createRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const request = await createRequest({
    ...req.body,
    requesterId: req.user.id,
  });

  res.status(201).json(request);
});

export const updateRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const request = await updateRequest({
    id: req.params.id,
    userId: req.user.id,
    role: req.user.role,
    data: req.body,
  });

  res.status(200).json(request);
});

export const deleteRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  await deleteRequest(req.params.id, req.user.id, req.user.role);
  res.status(200).json({ message: "Request deleted successfully" });
});
