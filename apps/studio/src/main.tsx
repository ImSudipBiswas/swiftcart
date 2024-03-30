import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

import Router from "@/router";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="swiftcart-dashboard-theme">
          <Router />
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  </React.StrictMode>
);
