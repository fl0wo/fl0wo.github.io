import { defineCollection, z, type SchemaContext } from 'astro:content'
import { glob } from 'astro/loaders'

const localizedFiles = (prefix = '**/') => [`${prefix}index.*.md`, `${prefix}index.*.mdx`]

/** Fields shared by everything rendered as an article: blog posts and 3lm lessons. */
const articleFields = ({ image }: SchemaContext) => ({
  title: z.string(),
  published: z.coerce.date(),
  draft: z.boolean().optional().default(false),
  description: z.string().optional(),
  author: z.string().optional(),
  coverImage: z
    .strictObject({
      src: image(),
      alt: z.string(),
    })
    .optional(),
  toc: z.boolean().optional().default(true),
})

const postsCollection = defineCollection({
  loader: glob({ pattern: localizedFiles(), base: './src/content/posts' }),
  schema: (context) =>
    z.object({
      ...articleFields(context),
      series: z.string().optional(),
      tags: z.array(z.string()).optional().default([]),
    }),
})

/**
 * 3lm (unlisted study notes). The folder layout is the source of truth:
 *   src/content/3lm/<archive>/index.<lang>.md           → an archive (e.g. seera)
 *   src/content/3lm/<archive>/<lesson>/index.<lang>.md  → a lesson in that archive
 */
const ilmArchivesCollection = defineCollection({
  loader: glob({ pattern: localizedFiles('*/'), base: './src/content/3lm' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // Position on the /3lm index; lower comes first.
    order: z.number().int().optional().default(0),
    draft: z.boolean().optional().default(false),
  }),
})

const ilmLessonsCollection = defineCollection({
  loader: glob({ pattern: localizedFiles('*/*/'), base: './src/content/3lm' }),
  schema: (context) =>
    z.object({
      ...articleFields(context),
      // Lesson number within its archive: defines reading order, must be unique.
      lesson: z.number().int().positive(),
    }),
})

const pagesCollection = defineCollection({
  loader: glob({ pattern: localizedFiles(), base: './src/content/pages' }),
  schema: z.object({
    layout: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
  }),
})

const homeCollection = defineCollection({
  loader: glob({ pattern: ['index.*.md', 'index.*.mdx'], base: './src/content/home' }),
  schema: ({ image }) =>
    z.object({
      avatarImage: z
        .object({
          src: image(),
          alt: z.string().optional().default('My avatar'),
        })
        .optional(),
      githubCalendar: z.string().optional(), // GitHub username for calendar
    }),
})

const addendumCollection = defineCollection({
  loader: glob({ pattern: ['index.*.md', 'index.*.mdx'], base: './src/content/addendum' }),
  schema: ({ image }) =>
    z.object({
      avatarImage: z
        .object({
          src: image(),
          alt: z.string().optional().default('My avatar'),
        })
        .optional(),
    }),
})

export const collections = {
  posts: postsCollection,
  pages: pagesCollection,
  home: homeCollection,
  addendum: addendumCollection,
  ilmArchives: ilmArchivesCollection,
  ilmLessons: ilmLessonsCollection,
}
