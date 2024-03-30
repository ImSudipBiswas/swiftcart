import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  isAuthRoute?: boolean;
  isAuthenticated: boolean;
}

const ProtectedRoute = ({
  children,
  isAuthRoute = false,
  isAuthenticated = false,
}: ProtectedRouteProps) => {
  if (isAuthRoute && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!isAuthRoute && !isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
