import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { Priority, RequestStatus, UserRole } from "../models/enums";
import { AppError } from "../utils/appError";
import { getPagination } from "../utils/pagination";

const buildOrderBy = (sortBy?: string, sortOrder?: string) => {
  const direction: Prisma.SortOrder = sortOrder === "asc" ? "asc" : "desc";
  switch (sortBy) {
    case "priority":
      return { priority: direction };
    case "status":
      return { status: direction };
    case "createdAt":
    default:
      return { createdAt: direction };
  }
};

export const listRequests = async (params: {
  page?: string;
  pageSize?: string;
  status?: RequestStatus;
  priority?: Priority;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  userId: string;
  role: UserRole;
}) => {
  const { page, pageSize, skip, take } = getPagination(
    params.page,
    params.pageSize
  );

  const where: Prisma.MaintenanceRequestWhereInput = {};
  if (params.status) where.status = params.status;
  if (params.priority) where.priority = params.priority;
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
      { location: { contains: params.search, mode: "insensitive" } },
      { category: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params.role !== UserRole.ADMIN) {
    where.requesterId = params.userId;
  }

  const [data, total] = await prisma.$transaction([
    prisma.maintenanceRequest.findMany({
      where,
      skip,
      take,
      orderBy: buildOrderBy(params.sortBy, params.sortOrder),
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.maintenanceRequest.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
};

export const getRequestById = async (
  id: string,
  userId: string,
  role: UserRole
) => {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!request) {
    throw new AppError("Request not found", 404);
  }

  if (role !== UserRole.ADMIN && request.requesterId !== userId) {
    throw new AppError("Forbidden", 403);
  }

  return request;
};

export const createRequest = async (payload: {
  title: string;
  description: string;
  location: string;
  category: string;
  priority: Priority;
  requesterId: string;
}) => {
  return prisma.maintenanceRequest.create({
    data: {
      title: payload.title,
      description: payload.description,
      location: payload.location,
      category: payload.category,
      priority: payload.priority,
      requesterId: payload.requesterId,
    },
  });
};

export const updateRequest = async (params: {
  id: string;
  userId: string;
  role: UserRole;
  data: {
    title?: string;
    description?: string;
    location?: string;
    category?: string;
    priority?: Priority;
    status?: RequestStatus;
  };
}) => {
  const existing = await prisma.maintenanceRequest.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    throw new AppError("Request not found", 404);
  }

  if (params.role !== UserRole.ADMIN && existing.requesterId !== params.userId) {
    throw new AppError("Forbidden", 403);
  }

  if (params.role !== UserRole.ADMIN && params.data.status) {
    throw new AppError("Only admins can update status", 403);
  }

  return prisma.maintenanceRequest.update({
    where: { id: params.id },
    data: params.data,
  });
};

export const deleteRequest = async (id: string, userId: string, role: UserRole) => {
  const existing = await prisma.maintenanceRequest.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError("Request not found", 404);
  }

  if (role !== UserRole.ADMIN && existing.requesterId !== userId) {
    throw new AppError("Forbidden", 403);
  }

  await prisma.maintenanceRequest.delete({ where: { id } });
};
