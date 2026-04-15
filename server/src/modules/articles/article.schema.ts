import { z } from "zod";

export const createArticleSchema = z.object({
    body: z.object({
        title: z.string()
            .min(3, "Title must be at least 3 characters long")
            .max(100, "Title must be at most 100 characters long"),
        summary: z.string()
            .min(10, "Summary must be at least 10 characters long")
            .max(300, "Summary must be at most 300 characters long"),
        content: z.string().min(20, "Content must be at least 20 characters long"),
        tags: z.array(z.string().min(1, "At least one tag is required")).optional(),
        coverImage: z.string().url("Cover image must be a valid URL").optional(),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
})

export const updateArticleSchema = z.object({
    body: z.object({
        title: z.string()
            .min(3, "Title must be at least 3 characters long")
            .max(100, "Title must be at most 100 characters long")
            .optional(),
        summary: z.string()
            .min(10, "Summary must be at least 10 characters long")
            .max(300, "Summary must be at most 300 characters long")
            .optional(),
        content: z.string().min(20, "Content must be at least 20 characters long").optional(),
        tags: z.array(z.string().min(1, "At least one tag is required")).optional(),
        coverImage: z.string().url("Cover image must be a valid URL").optional(),
    })
        .refine(
            (data) => data.title !== undefined || data.summary !== undefined
            || data.content !== undefined || data.tags !== undefined || data.coverImage !== undefined,
            {
                  message: "At least one field is required to update"
            }
        ),
    params: z.object({
        slug: z.string().min(1, "Slug is required"),
    }),
    query: z.object({}).optional(),
});

export const getArticleSchema = z.object({
    body: z.object({}).optional(),
    params: z.object({}).optional(),
    query: z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        tag: z.string().min(1).optional(),
    }),
});

export const getArticleBySlugSchema = z.object({
    body: z.object({}).optional(),
    params: z.object({
        slug: z.string().min(1, "Slug is required"),
    }),
    query: z.object({}).optional(),
});