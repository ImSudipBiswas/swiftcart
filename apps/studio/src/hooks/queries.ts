import { useQuery } from "@tanstack/react-query";

import type { UserQueryResult } from "@/types";
import { fetchCurrentUser } from "@/lib/actions/user";

export function useCurrentUser(): UserQueryResult {
  return useQuery({
    queryKey: ["user"],
    queryFn: fetchCurrentUser,
  });
}
