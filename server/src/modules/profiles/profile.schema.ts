import { z } from "zod";

export const getPublicProfileArticlesQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    username: z.string().min(1),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
    sort: z.enum(["newest", "likes"]).optional(),
  }),
});
