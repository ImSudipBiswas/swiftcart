import { z, type ZodError } from "zod";

export const throwZodError = (error: ZodError) => {
  return error.errors.map(err => ({ path: err.path[0], message: err.message }));
};

export const signUpSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .max(50, "Name must be at most 50 characters long"),
  username: z
    .string({ required_error: "Username is required" })
    .min(3, "Username must be at least 3 characters long")
    .max(50, "Username must be at most 50 characters long")
    .toLowerCase(),
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address")
    .toLowerCase(),
  password: z
    .string({ required_error: "password is required" })
    .min(6, "Password must be at least 6 characters long")
    .max(50, "Password must be at most 50 characters long"),
  role: z.optional(
    z.enum(["USER", "ADMIN"], { invalid_type_error: "Invalid role" }).default("USER")
  ),
});

export const signInSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address")
    .toLowerCase(),
  password: z
    .string({ required_error: "password is required" })
    .min(6, "Password must be at least 6 characters long")
    .max(50, "Password must be at most 50 characters long"),
});

export const updateUserSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .max(50, "Name must be at most 50 characters long"),
  username: z
    .string({ required_error: "Username is required" })
    .min(3, "Username must be at least 3 characters long")
    .max(50, "Username must be at most 50 characters long")
    .toLowerCase(),
});
