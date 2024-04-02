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

export const categorySchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .max(50, "Name must be at most 50 characters long")
    .toLowerCase(),
  description: z.optional(z.string().max(255, "Description must be at most 255 characters long")),
  labelText: z
    .string({ required_error: "Label text is required" })
    .min(15, "Label text must be at least 15 characters long")
    .max(150, "Label text must be at most 150 characters long"),
});

export const colorSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .max(50, "Name must be at most 50 characters long")
    .toLowerCase(),
  hex: z
    .string({ required_error: "Code is required" })
    .max(7, "Code must be at most 7 characters long")
    .toLowerCase()
    .refine(value => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value), {
      message: "Invalid color code",
    }),
  categoryId: z.string({ required_error: "Category is required" }),
});

export const sizeSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .max(50, "Name must be at most 50 characters long")
    .toLowerCase(),
  value: z.string({ required_error: "Value is required" }).toLowerCase(),
  categoryId: z.string({ required_error: "Category is required" }),
});
