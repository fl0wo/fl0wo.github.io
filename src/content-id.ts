import { assertLang, type Lang } from './i18n'

export function parseLocalizedId(id: string): { slug: string; lang: Lang } {
  const match = id.match(/^(?:(.+)\/)?index\.?(en|it|ar|zh)$/)

  if (!match) {
    throw new Error(`Unsupported localized content id: ${id}`)
  }

  return {
    slug: match[1] || 'index',
    lang: assertLang(match[2]),
  }
}

/**
 * Lesson slugs mirror their folder: src/content/3lm/<archive>/<lesson>/index.<lang>.md
 * yields the localized slug "<archive>/<lesson>".
 */
export function parseLessonSlug(slug: string): { archive: string; lesson: string } {
  const match = slug.match(/^([^/]+)\/([^/]+)$/)

  if (!match) {
    throw new Error(`Lesson content must live at 3lm/<archive>/<lesson>/index.<lang>.md, got: ${slug}`)
  }

  return { archive: match[1], lesson: match[2] }
}
