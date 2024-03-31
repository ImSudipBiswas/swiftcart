import { useAuth } from "@/hooks";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  isAuthRoute?: boolean;
}

export default function ProtectedRoute({ children, isAuthRoute = false }: ProtectedRouteProps) {
  const { isAdmin, isAuthenticated } = useAuth();
  const { pathname } = useLocation();

  if (isAuthRoute && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!isAuthRoute && !isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  if (isAdmin && pathname === "/request-role-change") {
    return <Navigate to="/" replace />;
  }

  if (!isAuthRoute && isAuthenticated && !isAdmin) {
    return <Navigate to="/request-role-change" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
