import { z } from "zod";

export const suggestCommunityTagsSchema = z.object({
    body: z.object({
        title: z.string().min(1).max(120),
        summary: z.string().min(1).max(300),
        content: z.string().min(1).max(100_000),
        tags: z.array(z.string().min(1)).optional(),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
});
