import { create } from "zustand";
import {
  MaintenanceRequest,
  PaginatedResponse,
  PaginationMeta,
} from "../types/request";
import * as requestService from "../services/request.service";

interface Filters {
  page: number;
  pageSize: number;
  status?: string;
  priority?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface RequestState {
  items: MaintenanceRequest[];
  pagination: PaginationMeta | null;
  filters: Filters;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  fetchRequests: (overrides?: Partial<Filters>) => Promise<void>;
  getRequest: (id: string) => Promise<MaintenanceRequest>;
  createRequest: (payload: {
    title: string;
    description: string;
    location: string;
    category: string;
    priority: string;
  }) => Promise<MaintenanceRequest>;
  updateRequest: (
    id: string,
    payload: Partial<{
      title: string;
      description: string;
      location: string;
      category: string;
      priority: string;
      status: string;
    }>
  ) => Promise<MaintenanceRequest>;
  deleteRequest: (id: string) => Promise<void>;
  clearMessages: () => void;
}

const defaultFilters: Filters = {
  page: 1,
  pageSize: 8,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const handleResponse = (response: PaginatedResponse<MaintenanceRequest>) => ({
  items: response.data,
  pagination: response.pagination,
});

export const useRequestStore = create<RequestState>((set, get) => ({
  items: [],
  pagination: null,
  filters: defaultFilters,
  isLoading: false,
  error: null,
  success: null,
  clearMessages: () => set({ error: null, success: null }),
  fetchRequests: async (overrides = {}) => {
    set({ isLoading: true, error: null, success: null });
    const nextFilters = { ...get().filters, ...overrides };
    try {
      const response = await requestService.fetchRequests(nextFilters);
      const { items, pagination } = handleResponse(response);
      set({
        items,
        pagination,
        filters: nextFilters,
      });
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? "Failed to load requests" });
    } finally {
      set({ isLoading: false });
    }
  },
  getRequest: async (id) => {
    set({ isLoading: true, error: null, success: null });
    try {
      return await requestService.fetchRequestById(id);
    } catch (error: any) {
      const message = error?.response?.data?.message ?? "Failed to load request";
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },
  createRequest: async (payload) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const created = await requestService.createRequest(payload);
      set({ success: "Request created successfully" });
      await get().fetchRequests();
      return created;
    } catch (error: any) {
      const message = error?.response?.data?.message ?? "Failed to create request";
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },
  updateRequest: async (id, payload) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const updated = await requestService.updateRequest(id, payload);
      set({ success: "Request updated successfully" });
      await get().fetchRequests();
      return updated;
    } catch (error: any) {
      const message = error?.response?.data?.message ?? "Failed to update request";
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },
  deleteRequest: async (id) => {
    set({ isLoading: true, error: null, success: null });
    try {
      await requestService.deleteRequest(id);
      set({ success: "Request deleted successfully" });
      await get().fetchRequests();
    } catch (error: any) {
      const message = error?.response?.data?.message ?? "Failed to delete request";
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },
}));
