import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
import { useAuthStore } from "./store/useAuthStore";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RequestsPage from "./pages/RequestsPage";
import RequestFormPage from "./pages/RequestFormPage";
import NotFoundPage from "./pages/NotFoundPage";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const { token } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/requests" replace />} />
        <Route
          path="/login"
          element={token ? <Navigate to="/requests" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/requests" replace /> : <RegisterPage />}
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <RequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/new"
          element={
            <ProtectedRoute>
              <RequestFormPage mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/:id"
          element={
            <ProtectedRoute>
              <RequestFormPage mode="edit" />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
};

export default App;
