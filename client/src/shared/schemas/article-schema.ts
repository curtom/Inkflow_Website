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
        .trim()
        .min(1, "Cover image is required")
        .url("请输入有效的封面图片地址"),
    tags: z.string().optional(),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;