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
