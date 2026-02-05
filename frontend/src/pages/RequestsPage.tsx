import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { MessageBanner } from "../components/MessageBanner";
import { Pagination } from "../components/Pagination";
import { SelectField } from "../components/SelectField";
import { StatusChip } from "../components/StatusChip";
import { TextField } from "../components/TextField";
import { useRequests } from "../hooks/useRequests";
import { useAuthStore } from "../store/useAuthStore";
import { MaintenanceRequest } from "../types/request";

const statusOptions = [
  { label: "All statuses", value: "ALL" },
  { label: "Open", value: "OPEN" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
];

const priorityOptions = [
  { label: "All priorities", value: "ALL" },
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
];

const sortOptions = [
  { label: "Newest first", value: "createdAt_desc" },
  { label: "Oldest first", value: "createdAt_asc" },
  { label: "Priority (high → low)", value: "priority_desc" },
  { label: "Priority (low → high)", value: "priority_asc" },
  { label: "Status (A → Z)", value: "status_asc" },
];

const RequestsPage = () => {
  const { user } = useAuthStore();
  const {
    items,
    pagination,
    filters,
    fetchRequests,
    deleteRequest,
    isLoading,
    error,
    success,
    clearMessages,
  } = useRequests(true);

  const [search, setSearch] = useState(filters.search ?? "");
  const [status, setStatus] = useState(filters.status ?? "ALL");
  const [priority, setPriority] = useState(filters.priority ?? "ALL");
  const [sort, setSort] = useState(
    `${filters.sortBy}_${filters.sortOrder}`
  );

  const showRequester = user?.role === "ADMIN";

  const tableRows = useMemo(
    () =>
      items.map((request: MaintenanceRequest) => (
        <tr key={request.id}>
          <td>
            <div className="card__title">{request.title}</div>
            <div className="card__subtitle">{request.category}</div>
          </td>
          <td>{request.location}</td>
          <td>{request.priority}</td>
          <td>
            <StatusChip status={request.status} />
          </td>
          {showRequester ? (
            <td>
              {request.requester?.name ?? "Unknown"}
              <div className="card__subtitle">{request.requester?.email}</div>
            </td>
          ) : null}
          <td>
            <div className="toolbar">
              <Link to={`/requests/${request.id}`}>
                <Button variant="secondary">View</Button>
              </Link>
              <Button
                variant="danger"
                onClick={() => {
                  if (window.confirm("Delete this request?")) {
                    deleteRequest(request.id);
                  }
                }}
                disabled={isLoading}
              >
                Delete
              </Button>
            </div>
          </td>
        </tr>
      )),
    [items, showRequester, deleteRequest, isLoading]
  );

  const onApplyFilters = () => {
    clearMessages();
    const [sortBy, sortOrder] = sort.split("_");
    fetchRequests({
      page: 1,
      search: search || undefined,
      status: status === "ALL" ? undefined : status,
      priority: priority === "ALL" ? undefined : priority,
      sortBy,
      sortOrder,
    });
  };

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card">
        <div className="toolbar" style={{ justifyContent: "space-between" }}>
          <div>
            <h2 className="card__title">Maintenance requests</h2>
            <p className="card__subtitle">
              Track issues, assign priorities, and keep facilities running.
            </p>
          </div>
          <Link to="/requests/new">
            <Button>Create request</Button>
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="grid grid--2">
          <TextField
            label="Search"
            placeholder="Search by title, category, location"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <SelectField
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          />
          <SelectField
            label="Priority"
            options={priorityOptions}
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          />
          <SelectField
            label="Sort by"
            options={sortOptions}
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          />
        </div>
        <div className="toolbar" style={{ marginTop: 16 }}>
          <Button variant="secondary" onClick={onApplyFilters}>
            Apply filters
          </Button>
        </div>
      </div>

      {error ? <MessageBanner type="error" message={error} /> : null}
      {success ? <MessageBanner type="success" message={success} /> : null}

      <div className="card">
        {isLoading ? <p>Loading requests...</p> : null}
        {!isLoading && items.length === 0 ? (
          <p>No requests found. Create the first one.</p>
        ) : null}
        {items.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Status</th>
                {showRequester ? <th>Requester</th> : null}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        ) : null}
      </div>

      {pagination ? (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(nextPage) => fetchRequests({ page: nextPage })}
        />
      ) : null}
    </div>
  );
};

export default RequestsPage;
