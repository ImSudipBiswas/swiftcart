import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const DashboardOverviewPage = lazy(() => import("./pages/dashboard"));

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardOverviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
