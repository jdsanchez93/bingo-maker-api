import { useAuth0 } from "@auth0/auth0-react";
import type { JSX } from "react";
import { Navigate, useLocation } from "react-router";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}