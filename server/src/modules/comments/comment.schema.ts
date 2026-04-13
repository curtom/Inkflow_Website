import { z } from "zod";

export const createCommentSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, "Comment content is required")
      .max(1000, "Comment must be at most 1000 characters"),
  }),
  params: z.object({
    slug: z.string().min(1, "Slug is required"),
  }),
  query: z.object({}).optional(),
});

export const getCommentsByArticleSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    slug: z.string().min(1, "Slug is required"),
  }),
  query: z.object({}).optional(),
});

export const deleteCommentSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    slug: z.string().min(1, "Slug is required"),
    commentId: z
      .string()
      .min(1, "Comment ID is required")
      .regex(/^[a-f\d]{24}$/i, "Comment ID must be a valid ObjectId"),
  }),
  query: z.object({}).optional(),
});