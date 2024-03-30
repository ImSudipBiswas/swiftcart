import type { UseQueryResult } from "@tanstack/react-query";

export interface User {
  id: string;
  username: string;
  email: string;
  image: string | null;
  name: string;
  role: "ADMIN" | "USER";
}

export type UserApiResponse = { user: User; message: string };

export type UserQueryResult = UseQueryResult<UserApiResponse | null, Error>;
