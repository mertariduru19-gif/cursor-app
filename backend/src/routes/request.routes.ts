import { Router } from "express";
import { z } from "zod";
import {
  createRequestHandler,
  deleteRequestHandler,
  getRequestHandler,
  listRequestsHandler,
  updateRequestHandler,
} from "../controllers/request.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { Priority, RequestStatus } from "../models/enums";

const router = Router();

const idParams = z.object({
  id: z.string().uuid(),
});

const listSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    pageSize: z.string().optional(),
    status: z.nativeEnum(RequestStatus).optional(),
    priority: z.nativeEnum(Priority).optional(),
    search: z.string().optional(),
    sortBy: z.enum(["createdAt", "priority", "status"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

const createSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120),
    description: z.string().min(10).max(2000),
    location: z.string().min(2).max(120),
    category: z.string().min(2).max(80),
    priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const updateSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120).optional(),
    description: z.string().min(10).max(2000).optional(),
    location: z.string().min(2).max(120).optional(),
    category: z.string().min(2).max(80).optional(),
    priority: z.nativeEnum(Priority).optional(),
    status: z.nativeEnum(RequestStatus).optional(),
  }),
  params: idParams,
  query: z.object({}).optional(),
});

const paramsSchema = z.object({
  params: idParams,
  query: z.object({}).optional(),
  body: z.object({}).optional(),
});

router.use(authenticate);

router.get("/", validate(listSchema), listRequestsHandler);
router.get("/:id", validate(paramsSchema), getRequestHandler);
router.post("/", validate(createSchema), createRequestHandler);
router.patch("/:id", validate(updateSchema), updateRequestHandler);
router.delete("/:id", validate(paramsSchema), deleteRequestHandler);

export default router;
