import api from "./api";
import { MaintenanceRequest, PaginatedResponse } from "../types/request";

export interface RequestQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  priority?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const fetchRequests = async (query: RequestQuery) => {
  const response = await api.get<PaginatedResponse<MaintenanceRequest>>(
    "/requests",
    { params: query }
  );
  return response.data;
};

export const fetchRequestById = async (id: string) => {
  const response = await api.get<MaintenanceRequest>(`/requests/${id}`);
  return response.data;
};

export const createRequest = async (payload: {
  title: string;
  description: string;
  location: string;
  category: string;
  priority: string;
}) => {
  const response = await api.post<MaintenanceRequest>("/requests", payload);
  return response.data;
};

export const updateRequest = async (
  id: string,
  payload: Partial<{
    title: string;
    description: string;
    location: string;
    category: string;
    priority: string;
    status: string;
  }>
) => {
  const response = await api.patch<MaintenanceRequest>(
    `/requests/${id}`,
    payload
  );
  return response.data;
};

export const deleteRequest = async (id: string) => {
  const response = await api.delete<{ message: string }>(`/requests/${id}`);
  return response.data;
};
