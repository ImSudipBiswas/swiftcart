import { createContext } from "react";

import type { User } from "@/types";
import { useCurrentUser } from "@/hooks/queries";

type AuthProviderState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

const initialState: AuthProviderState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

export const AuthContext = createContext<AuthProviderState>(initialState);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useCurrentUser();

  const value: AuthProviderState = {
    isLoading,
    user: data?.user || null,
    isAuthenticated: !!data?.user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
