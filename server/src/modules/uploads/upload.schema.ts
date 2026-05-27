import { z } from "zod";

export const presignUploadSchema = z.object({
    body: z.object({
        contentType: z.string().min(1, "contentType is required"),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
});
