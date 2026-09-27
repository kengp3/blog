import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './blog/_posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((value) => {
        const date = new Date(`${value}T00:00:00Z`);
        return !Number.isNaN(+date) && date.toISOString().slice(0, 10) === value;
      }, 'Use a valid YYYY-MM-DD calendar date'),
    permalink: z.string().regex(/^\/\d{4}\/\d{2}\/\d{2}\/[a-z0-9-]+\/$/),
    tags: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1),
    author: z.string(),
    location: z.string(),
    issue: z.number().int().positive().optional(),
  }),
});
export const collections = { posts };
