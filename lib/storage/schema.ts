import { z } from "zod";

export const savedNumberSchema = z.object({
  id: z.string(),
  areaCode: z.string(),
  local: z.string(),
  vanity: z.string(),
  numeric: z.string(),
  dialable: z.string(),
  words: z.array(z.string()).optional(),
  label: z.string().optional(),
  createdAt: z.number(),
});

export const wordListSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  words: z.array(z.string()),
  group: z.string().optional(),
  builtIn: z.boolean().optional(),
});

export const savedNumbersSchema = z.array(savedNumberSchema);
export const wordListsSchema = z.array(wordListSchema);

export const preferencesSchema = z.object({
  /** Anonymous, cookieless analytics. */
  analytics: z.boolean(),
});
