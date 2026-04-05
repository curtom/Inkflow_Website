import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        username: z.string()
            .min(3, "Username must be at least 3 characters")
            .max(20, "Password must be at least 20 characters"),
        email: z.email("Please enter a valid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.email("Please enter a valid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
});