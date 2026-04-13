import {z} from "zod";


export const settingsSchema = z
   .object({
       username: z
           .string()
           .min(3, "Username must be at least 3 characters long")
           .max(20, "Username must be at most 20 characters long"),
       bio: z
           .string()
           .max(300, "Bio must be at most 300 characters long")
           .optional()
           .or(z.literal("")),
       avatar: z
           .string()
           .url("Avatar must be a valid URL")
           .optional()
           .or(z.literal("")),
       password: z
           .string()
           .min(6, "Password must be at least 6 characters long")
           .optional()
           .or(z.literal("")),
   });

export type SettingsFormValues = z.infer<typeof settingsSchema>;