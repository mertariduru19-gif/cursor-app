import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { MessageBanner } from "../components/MessageBanner";
import { TextField } from "../components/TextField";
import { useAuthStore } from "../store/useAuthStore";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<RegisterForm>({
    defaultValues: { name: "", email: "", password: "" },
  });
  const { register: registerUser, token, isLoading, error, success, clearMessages } =
    useAuthStore();

  useEffect(() => {
    if (token) {
      navigate("/requests", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => () => clearMessages(), [clearMessages]);

  const onSubmit = async (data: RegisterForm) => {
    await registerUser(data.name, data.email, data.password);
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2 className="card__title">Create account</h2>
      <p className="card__subtitle">Start tracking facility issues.</p>
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        {error ? <MessageBanner type="error" message={error} /> : null}
        {success ? <MessageBanner type="success" message={success} /> : null}
        <TextField
          label="Full name"
          placeholder="Jane Doe"
          error={formState.errors.name?.message}
          {...register("name", { required: "Name is required" })}
        />
        <TextField
          label="Email"
          type="email"
          placeholder="name@facility.com"
          error={formState.errors.email?.message}
          {...register("email", { required: "Email is required" })}
        />
        <TextField
          label="Password"
          type="password"
          placeholder="Minimum 8 characters"
          helperText="Include at least one uppercase letter and a number."
          error={formState.errors.password?.message}
          {...register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "Min 8 characters" },
            pattern: {
              value: /^(?=.*[A-Z])(?=.*\d).+$/,
              message: "Use one uppercase letter and one number",
            },
          })}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Register"}
        </Button>
      </form>
    </div>
  );
};

export default RegisterPage;
