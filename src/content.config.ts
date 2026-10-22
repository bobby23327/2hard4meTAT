import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const mediaSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().min(1),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    description: z.string().min(1),
    track: z.enum(['game', 'engine', 'agent']),
    tags: z.array(z.string().min(1)).min(1),
    status: z.enum(['prototype', 'development', 'research', 'planned']),
    featured: z.boolean(),
    order: z.number().int().nonnegative(),
    cover: z.string().min(1),
    coverAlt: z.string().min(1),
    coverKind: z.enum(['concept', 'screenshot']).default('concept'),
    media: z.array(mediaSchema).min(1),
    github: z.string().url().optional(),
    demo: z.string().url().optional(),
    relatedPosts: z.array(z.string().min(1)),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string().min(1)).min(1),
    category: z.string().min(1),
    order: z.number().int().nonnegative().optional(),
  }),
});

export const collections = { projects, blog };
