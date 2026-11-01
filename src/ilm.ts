import { getCollection, type CollectionEntry } from 'astro:content'
import { parseLessonSlug } from './content-id'
import { contentSlug, getLocalizedCollection } from './content-utils'
import { formatUi, routePath, ui, type Lang } from './i18n'

export type IlmLesson = {
  entry: CollectionEntry<'ilmLessons'>
  archive: string
  slug: string
  number: number
  href: string
}

export type IlmArchive = {
  entry: CollectionEntry<'ilmArchives'>
  slug: string
  href: string
  /** Sorted by lesson number. */
  lessons: IlmLesson[]
}

/**
 * Every 3lm archive in `lang` with its lessons, ordered for display.
 * Throws on content mistakes (orphan lessons, duplicate lesson numbers) so they
 * fail the build instead of shipping a broken course.
 */
export async function getIlmArchives(lang: Lang): Promise<IlmArchive[]> {
  const [archiveEntries, lessonEntries, allArchiveEntries] = await Promise.all([
    getLocalizedCollection('ilmArchives', lang),
    getLocalizedCollection('ilmLessons', lang),
    getCollection('ilmArchives'),
  ])
  const existingArchiveSlugs = new Set(allArchiveEntries.map(contentSlug))

  const archives = new Map<string, IlmArchive>(
    archiveEntries.map((entry) => {
      const slug = contentSlug(entry)
      return [
        slug,
        { entry, slug, href: routePath(lang, { type: 'ilmArchive', archive: slug }), lessons: [] },
      ]
    }),
  )

  for (const entry of lessonEntries) {
    const { archive, lesson } = parseLessonSlug(contentSlug(entry))
    const parent = archives.get(archive)
    if (!parent) {
      // A draft archive hides its lessons too; a missing archive is a content bug.
      if (existingArchiveSlugs.has(archive)) continue
      throw new Error(
        `3lm lesson "${archive}/${lesson}" (${lang}) has no archive: add src/content/3lm/${archive}/index.${lang}.md`,
      )
    }
    parent.lessons.push({
      entry,
      archive,
      slug: lesson,
      number: entry.data.lesson,
      href: routePath(lang, { type: 'ilmLesson', archive, lesson }),
    })
  }

  for (const archive of archives.values()) {
    archive.lessons.sort((a, b) => a.number - b.number)
    archive.lessons.forEach((lesson, i) => {
      const prev = archive.lessons[i - 1]
      if (prev && prev.number === lesson.number) {
        throw new Error(
          `3lm archive "${archive.slug}" (${lang}) has two lessons numbered ${lesson.number}: ${prev.slug}, ${lesson.slug}`,
        )
      }
    })
  }

  return [...archives.values()].sort(
    (a, b) =>
      a.entry.data.order - b.entry.data.order || a.entry.data.title.localeCompare(b.entry.data.title),
  )
}

export function lessonLabel(lang: Lang, lesson: Pick<IlmLesson, 'number'>): string {
  return formatUi(ui[lang].lessonNumber, { n: lesson.number })
}
