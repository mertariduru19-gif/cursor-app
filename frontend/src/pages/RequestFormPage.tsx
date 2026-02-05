import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { MessageBanner } from "../components/MessageBanner";
import { SelectField } from "../components/SelectField";
import { TextAreaField } from "../components/TextAreaField";
import { TextField } from "../components/TextField";
import { useRequestStore } from "../store/useRequestStore";
import { useAuthStore } from "../store/useAuthStore";
import { MaintenanceRequest } from "../types/request";

interface RequestFormPageProps {
  mode: "create" | "edit";
}

interface RequestFormValues {
  title: string;
  description: string;
  location: string;
  category: string;
  priority: string;
  status?: string;
}

const priorityOptions = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
];

const statusOptions = [
  { label: "Open", value: "OPEN" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
];

const RequestFormPage = ({ mode }: RequestFormPageProps) => {
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useAuthStore();
  const [isReady, setIsReady] = useState(mode === "create");
  const { getRequest, createRequest, updateRequest, isLoading, error, success, clearMessages } =
    useRequestStore();
  const { register, handleSubmit, setValue, formState } =
    useForm<RequestFormValues>({
      defaultValues: {
        title: "",
        description: "",
        location: "",
        category: "",
        priority: "MEDIUM",
        status: "OPEN",
      },
    });

  useEffect(() => () => clearMessages(), [clearMessages]);

  useEffect(() => {
    const loadRequest = async () => {
      if (mode === "edit" && params.id) {
        const data: MaintenanceRequest = await getRequest(params.id);
        setValue("title", data.title);
        setValue("description", data.description);
        setValue("location", data.location);
        setValue("category", data.category);
        setValue("priority", data.priority);
        setValue("status", data.status);
        setIsReady(true);
      }
    };

    loadRequest();
  }, [mode, params.id, getRequest, setValue]);

  const onSubmit = async (values: RequestFormValues) => {
    if (mode === "create") {
      await createRequest(values);
      navigate("/requests");
      return;
    }

    if (!params.id) {
      return;
    }

    const payload = user?.role === "ADMIN" ? values : { ...values, status: undefined };
    await updateRequest(params.id, payload);
    navigate("/requests");
  };

  return (
    <div className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2 className="card__title">
        {mode === "create" ? "Create request" : "Update request"}
      </h2>
      <p className="card__subtitle">
        {mode === "create"
          ? "Describe the issue so the team can act quickly."
          : "Keep request details accurate and up to date."}
      </p>
      {!isReady ? <p>Loading request...</p> : null}
      {isReady ? (
        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          {error ? <MessageBanner type="error" message={error} /> : null}
          {success ? <MessageBanner type="success" message={success} /> : null}
          <TextField
            label="Title"
            placeholder="Short description"
            error={formState.errors.title?.message}
            {...register("title", { required: "Title is required" })}
          />
          <TextAreaField
            label="Description"
            placeholder="Provide context and impact"
            error={formState.errors.description?.message}
            {...register("description", { required: "Description is required" })}
          />
          <TextField
            label="Location"
            placeholder="Building, floor, room"
            error={formState.errors.location?.message}
            {...register("location", { required: "Location is required" })}
          />
          <TextField
            label="Category"
            placeholder="Plumbing, Electrical, HVAC..."
            error={formState.errors.category?.message}
            {...register("category", { required: "Category is required" })}
          />
          <SelectField
            label="Priority"
            options={priorityOptions}
            error={formState.errors.priority?.message}
            {...register("priority")}
          />
          {user?.role === "ADMIN" && mode === "edit" ? (
            <SelectField
              label="Status"
              options={statusOptions}
              error={formState.errors.status?.message}
              {...register("status")}
            />
          ) : null}
          <div className="toolbar">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/requests")}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
};

export default RequestFormPage;
