import { z } from "zod";
import mongoose from "mongoose";

export const threadSchema = z.object({
  description: z.string().min(1, { message: 'Description is required' }),
  images: z.array(z.instanceof(File)).optional(), // Optional array of File instances
  tag: z.string().optional(), // Optional valid ObjectId string
  videos: z.array(z.instanceof(File)).optional(),
});
