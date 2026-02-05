import { RequestStatus } from "../types/request";

const classMap: Record<RequestStatus, string> = {
  OPEN: "chip chip--open",
  IN_PROGRESS: "chip chip--progress",
  RESOLVED: "chip chip--resolved",
  CLOSED: "chip chip--closed",
};

const labelMap: Record<RequestStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const StatusChip = ({ status }: { status: RequestStatus }) => (
  <span className={classMap[status]}>{labelMap[status]}</span>
);
