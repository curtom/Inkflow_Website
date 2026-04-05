import {z} from "zod";

export const articleSchema = z.object({
    title: z
       .string()
        .min(3, "Title must be at least 3 characters long")
        .max(120, "Title must be at most 120 characters long"),
    summary: z
        .string()
        .min(10, "Summary must be at least 10 characters long")
        .max(300, "Summary must be at least 300 characters long"),
    content: z
        .string()
        .min(20, "Content must be at least 20 characters"),
    coverImage: z
        .string()
        .url("Cover image must be a valid URL")
        .or(z.literal(""))
        .optional(),
    tags: z.string().optional(),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;