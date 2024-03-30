import { useState } from "react";
import {
  QueryClientProvider,
  QueryClient,
  type QueryClientProviderProps,
  type QueryClientConfig,
} from "@tanstack/react-query";

interface QueryProviderProps extends Omit<QueryClientProviderProps, "client"> {
  children: React.ReactNode;
}

const defaultConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
};

export function QueryProvider({ children, ...props }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient(defaultConfig));

  return (
    <QueryClientProvider client={queryClient} {...props}>
      {children}
    </QueryClientProvider>
  );
}
