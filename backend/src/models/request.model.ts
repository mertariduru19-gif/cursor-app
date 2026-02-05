import { Priority, RequestStatus } from "./enums";

export interface RequestSummary {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  priority: Priority;
  status: RequestStatus;
  requesterId: string;
  createdAt: Date;
  updatedAt: Date;
}
