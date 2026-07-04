import { getCollection, type CollectionEntry } from 'astro:content'
import { slug } from 'github-slugger'
import { parseLocalizedId } from './content-id'
import { routePath, type Lang } from './i18n'
import type { Collation, CollationGroup } from './types'

export { parseLocalizedId } from './content-id'

type LocalizedCollection = 'posts' | 'pages' | 'home' | 'addendum'

export function contentSlug(entry: CollectionEntry<LocalizedCollection>): string {
  return parseLocalizedId(entry.id).slug
}

export async function getLocalizedCollection<C extends LocalizedCollection>(
  collection: C,
  lang: Lang,
): Promise<CollectionEntry<C>[]> {
  return getCollection(collection, ({ id, data }) => {
    const parsed = parseLocalizedId(id)
    const isDraftPost = collection === 'posts' && 'draft' in data && data.draft === true
    return parsed.lang === lang && (collection !== 'posts' || !import.meta.env.PROD || !isDraftPost)
  })
}

export async function getLocalizedEntry<C extends LocalizedCollection>(
  collection: C,
  lang: Lang,
  slug: string,
): Promise<CollectionEntry<C> | undefined> {
  const entries = await getLocalizedCollection(collection, lang)
  return entries.find((entry) => parseLocalizedId(entry.id).slug === slug)
}

export async function getSortedPosts(lang: Lang): Promise<CollectionEntry<'posts'>[]> {
  const posts = await getLocalizedCollection('posts', lang)
  return posts.sort((a, b) => (a.data.published < b.data.published ? -1 : 1))
}

abstract class PostsCollationGroup implements CollationGroup<'posts'> {
  title: string
  url: string
  collations: Collation<'posts'>[]

  constructor(title: string, url: string, collations: Collation<'posts'>[]) {
    this.title = title
    this.url = url
    this.collations = collations
  }

  sortCollationsAlpha(): Collation<'posts'>[] {
    this.collations.sort((a, b) => a.title.localeCompare(b.title))
    return this.collations
  }

  sortCollationsLargest(): Collation<'posts'>[] {
    this.collations.sort((a, b) => b.entries.length - a.entries.length)
    return this.collations
  }

  sortCollationsMostRecent(): Collation<'posts'>[] {
    this.collations.sort((a, b) => {
      const aDate = a.entries[a.entries.length - 1].data.published
      const bDate = b.entries[b.entries.length - 1].data.published
      return aDate < bDate ? 1 : -1
    })
    return this.collations
  }

  add(item: CollectionEntry<'posts'>, collationTitle: string): void {
    const collationTitleSlug = slug(collationTitle.trim())
    const existing = this.collations.find((i) => i.titleSlug === collationTitleSlug)
    if (existing) {
      const alreadyHasThisPost = existing.entries.find((e) => e.id === item.id)
      if (!alreadyHasThisPost) {
        existing.entries.push(item)
      }
    } else {
      this.collations.push({
        title: collationTitle,
        titleSlug: collationTitleSlug,
        url: `${this.url}/${encodeURIComponent(collationTitleSlug)}`,
        entries: [item],
      })
    }
  }

  match(rawKey: string): Collation<'posts'> | undefined {
    return this.collations.find((entry) => entry.title === rawKey)
  }

  matchMany(rawKeys: string[]): Collation<'posts'>[] {
    return this.collations.filter((entry) => rawKeys.includes(entry.title))
  }
}

export class SeriesGroup extends PostsCollationGroup {
  private constructor(title: string, url: string, items: Collation<'posts'>[]) {
    super(title, url, items)
  }

  static async build(lang: Lang, posts?: CollectionEntry<'posts'>[]): Promise<SeriesGroup> {
    const sortedPosts = posts || (await getSortedPosts(lang))
    const seriesGroup = new SeriesGroup('Series', routePath(lang, { type: 'series', slug: '' }).replace(/\/$/, ''), [])
    sortedPosts.forEach((post) => {
      const frontmatterSeries = post.data.series
      if (frontmatterSeries) {
        seriesGroup.add(post, frontmatterSeries)
      }
    })
    return seriesGroup
  }
}

export class TagsGroup extends PostsCollationGroup {
  private constructor(title: string, url: string, items: Collation<'posts'>[]) {
    super(title, url, items)
  }

  static async build(lang: Lang, posts?: CollectionEntry<'posts'>[]): Promise<TagsGroup> {
    const sortedPosts = posts || (await getSortedPosts(lang))
    const tagsGroup = new TagsGroup('Tags', `/${lang}/tags`, [])
    sortedPosts.forEach((post) => {
      const frontmatterTags = post.data.tags || []
      frontmatterTags.forEach((tag) => tagsGroup.add(post, tag))
    })
    return tagsGroup
  }
}

export function getPostSequenceContext(
  post: CollectionEntry<'posts'>,
  posts: CollectionEntry<'posts'>[],
) {
  const index = posts.findIndex((p) => p.id === post.id)
  const prev = index > 0 ? posts[index - 1] : undefined
  const next = index < posts.length - 1 ? posts[index + 1] : undefined
  return { index, prev, next }
}
