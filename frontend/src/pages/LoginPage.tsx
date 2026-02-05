import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { MessageBanner } from "../components/MessageBanner";
import { TextField } from "../components/TextField";
import { useAuthStore } from "../store/useAuthStore";

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
  });
  const { login, token, isLoading, error, success, clearMessages } =
    useAuthStore();

  useEffect(() => {
    if (token) {
      navigate("/requests", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => () => clearMessages(), [clearMessages]);

  const onSubmit = async (data: LoginForm) => {
    await login(data.email, data.password);
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2 className="card__title">Welcome back</h2>
      <p className="card__subtitle">Login to manage maintenance requests.</p>
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        {error ? <MessageBanner type="error" message={error} /> : null}
        {success ? <MessageBanner type="success" message={success} /> : null}
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
          placeholder="Your password"
          error={formState.errors.password?.message}
          {...register("password", { required: "Password is required" })}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Login"}
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
