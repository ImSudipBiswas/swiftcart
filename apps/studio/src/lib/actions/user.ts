import type { UserApiResponse } from "@/types";
import { api } from "@/lib/utils";

export const fetchCurrentUser = async () => {
  return (await api.get<UserApiResponse>("/user/v1/current")).data;
};
