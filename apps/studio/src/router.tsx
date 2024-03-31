import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "ui/components/toaster";

import { useAuth } from "@/hooks";

const NotFound = lazy(() => import("@/pages/not-found"));
const Loading = lazy(() => import("@/components/loading"));
const ProtectedRoute = lazy(() => import("@/components/protected-route"));

const AuthSignInPage = lazy(() => import("@/pages/auth/sign-in"));
const AuthSignUpPage = lazy(() => import("@/pages/auth/sign-up"));
const AuthMessagePage = lazy(() => import("@/pages/auth/message"));
const AuthVerifyEmailPage = lazy(() => import("@/pages/auth/verify-email"));

const DashboardOverviewPage = lazy(() => import("@/pages/dashboard"));

export default function Router() {
  const { isLoading } = useAuth();

  if (isLoading) return <Loading />;

  return (
    <BrowserRouter>
      <Toaster />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route element={<ProtectedRoute isAuthRoute={true} />}>
            <Route path="/auth/sign-in" element={<AuthSignInPage />} />
            <Route path="/auth/sign-up" element={<AuthSignUpPage />} />
            <Route path="/auth/message" element={<AuthMessagePage />} />
            <Route path="/auth/verify-email" element={<AuthVerifyEmailPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardOverviewPage />} />
          </Route>
          {/* <Route path="/request-role-change" element={<RequestRoleChangePage />} /> */}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
