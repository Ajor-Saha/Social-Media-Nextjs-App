import { z } from "zod";

export const communitySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  coverImage: z
    .any()
    .refine((file) => file instanceof File || file === null, {
      message: "Cover image must be a file",
    })
    .nullable(),
});
