import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useAuth } from "@/hooks";

const Loading = lazy(() => import("@/components/loading"));
const ProtectedRoute = lazy(() => import("@/components/protected-route"));

const AuthSignInPage = lazy(() => import("@/pages/auth/sign-in"));
const AuthSignUpPage = lazy(() => import("@/pages/auth/sign-up"));

const DashboardOverviewPage = lazy(() => import("@/pages/dashboard"));

export default function Router() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <Loading />;

  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} isAuthRoute={true} />}>
            <Route path="/auth/sign-in" element={<AuthSignInPage />} />
            <Route path="/auth/sign-up" element={<AuthSignUpPage />} />
          </Route>
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route path="/" element={<DashboardOverviewPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
