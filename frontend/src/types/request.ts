export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type RequestStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface Requester {
  id: string;
  name: string;
  email: string;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  priority: Priority;
  status: RequestStatus;
  requesterId: string;
  requester?: Requester;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
