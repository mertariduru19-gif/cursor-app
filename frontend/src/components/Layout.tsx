import { PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "./Button";

export const Layout = ({ children }: PropsWithChildren) => {
  const { user, logout } = useAuthStore();

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="navbar__brand">Facility Maintenance Manager</div>
        <div className="navbar__actions">
          <Link to="/requests">Requests</Link>
          <Link to="/requests/new">New request</Link>
          {user ? (
            <>
              <span>
                {user.name} · {user.role}
              </span>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </header>
      <main className="container">{children}</main>
      <footer className="footer">Operational visibility for every facility</footer>
    </div>
  );
};
