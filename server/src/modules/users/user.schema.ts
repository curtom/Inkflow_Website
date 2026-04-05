import { z } from "zod";

export const updateCurrentUserSchema = z.object({
    body: z.object({
        username: z.string()
            .min(3, "Username must be at least 3 characters")
            .max(20, "Username must be at most 20 characters")
            .optional(),
        bio: z.string().max(300, "Bio must be at most 300 characters").optional(),
        avatar: z.string().url().optional(),
        password: z.string().min(6, "Password must be at least 6 characters").optional(),
    })
        .refine(
            (data) =>
                data.username !== undefined ||
                data.bio !== undefined ||
                data.avatar !== undefined ||
                data.password !== undefined,
            {
                message: "At least one field must be provided",
            }
        ),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
});