# Multilingual Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build static language-prefixed pages for English, Italian, Arabic, and Chinese, with English as the source of truth and copy-paste prompt files for generated translations.

**Architecture:** Add a typed i18n layer for supported languages, route generation, UI chrome translations, and alternate URLs. Store localized Markdown as sibling files such as `index.en.md`, `index.it.md`, `index.ar.md`, and `index.zh.md` inside the same content bundle so assets stay shared. Add deterministic prompt generation and validation scripts, then rewire Astro routes and components to use locale-aware helpers.

**Tech Stack:** Astro 5, TypeScript, Markdown/MDX content collections, Vitest, tsx, gray-matter, Node.js filesystem APIs, Pagefind postbuild.

## Global Constraints

- Publish language-prefixed static routes for every public page.
- Keep canonical slugs stable across languages so translated variants of a post share the same slug.
- Keep English Markdown and MDX as the source of truth.
- Generate prompt files that can be pasted into any translation tool.
- Preserve Markdown, MDX, frontmatter, code fences, directives, links, images, raw HTML, and technical identifiers during translation.
- Provide a validation path that catches broken translated frontmatter, missing translations, invalid languages, missing assets, and route mismatches.
- Support Arabic right-to-left rendering through correct `html lang` and `dir` attributes.
- Keep the site statically generated and compatible with the current Cloudflare/static deployment flow.
- Do not call translation APIs directly in the first implementation.
- Do not translate slugs in the first implementation.
- Do not make translations happen client-side at runtime.
- Supported language codes are exactly `en`, `it`, `ar`, and `zh`.

---

## File Structure

- Create `src/i18n.ts`: supported language metadata, UI dictionary, route helpers, alternate link helpers.
- Create `src/content-utils.ts`: locale-aware Astro content collection helpers and localized post/tag/series grouping helpers.
- Modify `src/content.config.ts`: load sibling localized Markdown files and add a `pages` collection.
- Create `scripts/i18n/shared.ts`: filesystem discovery, frontmatter parsing, language/path helpers shared by prompt and validation scripts.
- Create `scripts/i18n/prompts.ts`: generate prompt files from English source content.
- Create `scripts/i18n/validate.ts`: validate translated sibling files and local asset references.
- Create `test/i18n/i18n.test.ts`: pure i18n route/dictionary tests.
- Create `test/i18n/scripts.test.ts`: prompt and validation tests using a temp fixture tree.
- Migrate current content into sibling localized files under `src/content/home`, `src/content/addendum`, `src/content/pages`, and `src/content/posts`.
- Replace public route files with locale-prefixed route files under `src/pages/[lang]`.
- Modify shared components and layouts to receive `lang` and render localized URLs/text.
- Modify `package.json`: add test/i18n scripts and dev dependencies.
- Modify `README.md`: document the English edit and prompt-generation workflow.

---

### Task 1: Add Test Harness And I18n Primitives

**Files:**
- Modify: `package.json`
- Create: `src/i18n.ts`
- Create: `test/i18n/i18n.test.ts`

**Interfaces:**
- Produces:
  - `type Lang = 'en' | 'it' | 'ar' | 'zh'`
  - `supportedLangs: readonly Lang[]`
  - `defaultLang: Lang`
  - `isLang(value: string): value is Lang`
  - `assertLang(value: string): Lang`
  - `languageMeta: Record<Lang, { code: Lang; label: string; nativeLabel: string; dir: 'ltr' | 'rtl'; locale: string }>`
  - `ui: Record<Lang, UiText>`
  - `routePath(lang: Lang, route: LocalizedRoute): string`
  - `alternateLinks(route: LocalizedRoute): Array<{ lang: Lang | 'x-default'; href: string }>`

- [ ] **Step 1: Install local test/dev tooling**

Run:

```bash
pnpm install -D vitest tsx gray-matter
```

Expected: `package.json` and `pnpm-lock.yaml` update with `vitest`, `tsx`, and `gray-matter`.

- [ ] **Step 2: Add package scripts**

Edit `package.json` scripts to include these keys while preserving existing scripts:

```json
{
  "scripts": {
    "astro": "astro",
    "build": "pnpm run i18n:validate && astro build",
    "dev": "astro dev",
    "format": "prettier --write .",
    "i18n:prompts": "tsx scripts/i18n/prompts.ts",
    "i18n:test": "vitest run test/i18n",
    "i18n:validate": "tsx scripts/i18n/validate.ts",
    "postbuild": "pagefind --site dist",
    "preview": "astro preview",
    "test": "vitest run",
    "deploy": "npx wrangler deploy"
  }
}
```

- [ ] **Step 3: Write the failing i18n tests**

Create `test/i18n/i18n.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import {
  alternateLinks,
  assertLang,
  defaultLang,
  isLang,
  languageMeta,
  routePath,
  supportedLangs,
  ui,
} from '../../src/i18n'

describe('language metadata', () => {
  test('defines the supported languages and default language', () => {
    expect(supportedLangs).toEqual(['en', 'it', 'ar', 'zh'])
    expect(defaultLang).toBe('en')
    expect(isLang('it')).toBe(true)
    expect(isLang('de')).toBe(false)
    expect(() => assertLang('de')).toThrow('Unsupported language: de')
  })

  test('marks Arabic as right-to-left and all other languages as left-to-right', () => {
    expect(languageMeta.en.dir).toBe('ltr')
    expect(languageMeta.it.dir).toBe('ltr')
    expect(languageMeta.ar.dir).toBe('rtl')
    expect(languageMeta.zh.dir).toBe('ltr')
  })

  test('has complete UI dictionaries for every language', () => {
    const englishKeys = Object.keys(ui.en)

    for (const lang of supportedLangs) {
      expect(Object.keys(ui[lang]).sort()).toEqual(englishKeys.sort())
      expect(ui[lang].navArchive.length).toBeGreaterThan(0)
      expect(ui[lang].languageSwitcherLabel.length).toBeGreaterThan(0)
    }
  })
})

describe('localized route helpers', () => {
  test('generates home, page, post, tag, series, archive, and rss paths', () => {
    expect(routePath('en', { type: 'home' })).toBe('/en/')
    expect(routePath('it', { type: 'page', slug: 'about' })).toBe('/it/about')
    expect(routePath('ar', { type: 'post', slug: 'showing-off-blog-features' })).toBe(
      '/ar/posts/showing-off-blog-features',
    )
    expect(routePath('zh', { type: 'posts', page: 2 })).toBe('/zh/posts/2')
    expect(routePath('it', { type: 'tag', slug: 'astro' })).toBe('/it/tags/astro')
    expect(routePath('ar', { type: 'tag', slug: 'astro', page: 3 })).toBe(
      '/ar/tags/astro/3',
    )
    expect(routePath('zh', { type: 'series', slug: 'build-notes' })).toBe(
      '/zh/series/build-notes',
    )
    expect(routePath('en', { type: 'rss' })).toBe('/en/rss.xml')
  })

  test('generates hreflang alternates plus x-default', () => {
    expect(alternateLinks({ type: 'post', slug: 'hello' })).toEqual([
      { lang: 'en', href: '/en/posts/hello' },
      { lang: 'it', href: '/it/posts/hello' },
      { lang: 'ar', href: '/ar/posts/hello' },
      { lang: 'zh', href: '/zh/posts/hello' },
      { lang: 'x-default', href: '/en/posts/hello' },
    ])
  })
})
```

- [ ] **Step 4: Run the failing tests**

Run:

```bash
pnpm run i18n:test
```

Expected: FAIL because `src/i18n.ts` does not exist.

- [ ] **Step 5: Implement `src/i18n.ts`**

Create `src/i18n.ts`:

```ts
export const supportedLangs = ['en', 'it', 'ar', 'zh'] as const
export type Lang = (typeof supportedLangs)[number]
export const defaultLang: Lang = 'en'

export type TextDirection = 'ltr' | 'rtl'

export type LanguageMeta = {
  code: Lang
  label: string
  nativeLabel: string
  dir: TextDirection
  locale: string
}

export const languageMeta: Record<Lang, LanguageMeta> = {
  en: { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr', locale: 'en-US' },
  it: { code: 'it', label: 'Italian', nativeLabel: 'Italiano', dir: 'ltr', locale: 'it-IT' },
  ar: { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl', locale: 'ar' },
  zh: { code: 'zh', label: 'Chinese', nativeLabel: '中文', dir: 'ltr', locale: 'zh-CN' },
}

export type UiText = {
  navHome: string
  navAbout: string
  navProjects: string
  navArchive: string
  articles: string
  series: string
  tags: string
  morePosts: string
  comments: string
  previous: string
  next: string
  newerPosts: string
  olderPosts: string
  read: string
  continueReading: string
  nextPost: string
  archiveTitle: string
  archiveDescription: string
  openSearch: string
  searchDialogLabel: string
  searchProductionOnly: string
  footerText: string
  languageSwitcherLabel: string
}

export const ui: Record<Lang, UiText> = {
  en: {
    navHome: 'Home',
    navAbout: 'About',
    navProjects: 'Projects',
    navArchive: 'Archive',
    articles: 'Articles',
    series: 'Series',
    tags: 'Tags',
    morePosts: 'More Posts',
    comments: 'Comments',
    previous: 'Previous',
    next: 'Next',
    newerPosts: 'Newer Posts',
    olderPosts: 'Older Posts',
    read: 'Read',
    continueReading: 'Continue',
    nextPost: 'Next',
    archiveTitle: 'Archive',
    archiveDescription: 'All posts in the archive',
    openSearch: 'Open Search',
    searchDialogLabel: 'Search',
    searchProductionOnly: 'Search is only available in production builds. Try building and previewing the site to test it out locally.',
    footerText: '© 2025 Florian Sabani, from Italy with pizza and love. All rights reserved.',
    languageSwitcherLabel: 'Language',
  },
  it: {
    navHome: 'Home',
    navAbout: 'Chi sono',
    navProjects: 'Progetti',
    navArchive: 'Archivio',
    articles: 'Articoli',
    series: 'Serie',
    tags: 'Tag',
    morePosts: 'Altri post',
    comments: 'Commenti',
    previous: 'Precedente',
    next: 'Successivo',
    newerPosts: 'Post più recenti',
    olderPosts: 'Post meno recenti',
    read: 'Leggi',
    continueReading: 'Continua',
    nextPost: 'Successivo',
    archiveTitle: 'Archivio',
    archiveDescription: 'Tutti i post nell’archivio',
    openSearch: 'Apri ricerca',
    searchDialogLabel: 'Ricerca',
    searchProductionOnly: 'La ricerca è disponibile solo nelle build di produzione. Crea una build e visualizza l’anteprima del sito per provarla localmente.',
    footerText: '© 2025 Florian Sabani, dall’Italia con pizza e amore. Tutti i diritti riservati.',
    languageSwitcherLabel: 'Lingua',
  },
  ar: {
    navHome: 'الرئيسية',
    navAbout: 'نبذة عني',
    navProjects: 'المشاريع',
    navArchive: 'الأرشيف',
    articles: 'المقالات',
    series: 'السلاسل',
    tags: 'الوسوم',
    morePosts: 'مقالات أخرى',
    comments: 'التعليقات',
    previous: 'السابق',
    next: 'التالي',
    newerPosts: 'مقالات أحدث',
    olderPosts: 'مقالات أقدم',
    read: 'اقرأ',
    continueReading: 'تابع',
    nextPost: 'التالي',
    archiveTitle: 'الأرشيف',
    archiveDescription: 'كل المقالات في الأرشيف',
    openSearch: 'افتح البحث',
    searchDialogLabel: 'بحث',
    searchProductionOnly: 'البحث متاح فقط في builds الإنتاج. ابن الموقع واعرضه محليا لتجربته.',
    footerText: '© 2025 فلوريان ساباني، من إيطاليا مع البيتزا والحب. جميع الحقوق محفوظة.',
    languageSwitcherLabel: 'اللغة',
  },
  zh: {
    navHome: '首页',
    navAbout: '关于我',
    navProjects: '项目',
    navArchive: '归档',
    articles: '文章',
    series: '系列',
    tags: '标签',
    morePosts: '更多文章',
    comments: '评论',
    previous: '上一页',
    next: '下一页',
    newerPosts: '较新的文章',
    olderPosts: '较早的文章',
    read: '阅读',
    continueReading: '继续',
    nextPost: '下一篇',
    archiveTitle: '归档',
    archiveDescription: '归档中的所有文章',
    openSearch: '打开搜索',
    searchDialogLabel: '搜索',
    searchProductionOnly: '搜索仅在生产构建中可用。请构建并预览网站以在本地测试。',
    footerText: '© 2025 Florian Sabani，来自意大利，带着披萨与热爱。保留所有权利。',
    languageSwitcherLabel: '语言',
  },
}

export type LocalizedRoute =
  | { type: 'home' }
  | { type: 'page'; slug: 'about' | 'projects' }
  | { type: 'posts'; page?: number }
  | { type: 'post'; slug: string }
  | { type: 'tag'; slug: string; page?: number }
  | { type: 'series'; slug: string }
  | { type: 'rss' }

export function isLang(value: string): value is Lang {
  return supportedLangs.includes(value as Lang)
}

export function assertLang(value: string): Lang {
  if (!isLang(value)) {
    throw new Error(`Unsupported language: ${value}`)
  }

  return value
}

export function routePath(lang: Lang, route: LocalizedRoute): string {
  const prefix = `/${lang}`

  switch (route.type) {
    case 'home':
      return `${prefix}/`
    case 'page':
      return `${prefix}/${route.slug}`
    case 'posts':
      return route.page && route.page > 1 ? `${prefix}/posts/${route.page}` : `${prefix}/posts`
    case 'post':
      return `${prefix}/posts/${route.slug}`
    case 'tag':
      return route.page && route.page > 1
        ? `${prefix}/tags/${encodeURIComponent(route.slug)}/${route.page}`
        : `${prefix}/tags/${encodeURIComponent(route.slug)}`
    case 'series':
      return `${prefix}/series/${encodeURIComponent(route.slug)}`
    case 'rss':
      return `${prefix}/rss.xml`
  }
}

export function alternateLinks(route: LocalizedRoute): Array<{ lang: Lang | 'x-default'; href: string }> {
  return [
    ...supportedLangs.map((lang) => ({ lang, href: routePath(lang, route) })),
    { lang: 'x-default' as const, href: routePath(defaultLang, route) },
  ]
}
```

- [ ] **Step 6: Run tests and commit**

Run:

```bash
pnpm run i18n:test
```

Expected: PASS for `test/i18n/i18n.test.ts`.

Commit:

```bash
git add package.json pnpm-lock.yaml src/i18n.ts test/i18n/i18n.test.ts
git commit -m "feat: add multilingual route primitives"
```

---

### Task 2: Add Prompt Generation And Validation Script Core

**Files:**
- Create: `scripts/i18n/shared.ts`
- Create: `scripts/i18n/prompts.ts`
- Create: `scripts/i18n/validate.ts`
- Create: `test/i18n/scripts.test.ts`

**Interfaces:**
- Consumes:
  - `supportedLangs`, `defaultLang`, `Lang`, `isLang` from `src/i18n.ts`.
- Produces:
  - `type SourceFile = { sourcePath: string; relativePath: string; slug: string; kind: 'home' | 'addendum' | 'page' | 'post'; extension: '.md' | '.mdx'; content: string; data: Record<string, unknown> }`
  - `discoverEnglishSources(rootDir: string): SourceFile[]`
  - `destinationFor(source: SourceFile, lang: Exclude<Lang, 'en'>): string`
  - `promptPathFor(source: SourceFile, lang: Exclude<Lang, 'en'>): string`
  - `buildTranslationPrompt(source: SourceFile, lang: Exclude<Lang, 'en'>): string`
  - `validateTranslations(rootDir: string): string[]`

- [ ] **Step 1: Write failing script tests**

Create `test/i18n/scripts.test.ts`:

```ts
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import {
  buildTranslationPrompt,
  destinationFor,
  discoverEnglishSources,
  promptPathFor,
  validateTranslations,
} from '../../scripts/i18n/shared'

function fixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'fl0wo-i18n-'))
  mkdirSync(join(root, 'src/content/posts/hello'), { recursive: true })
  writeFileSync(
    join(root, 'src/content/posts/hello/index.en.md'),
    [
      '---',
      'title: Hello',
      'published: 2026-07-04',
      "tags: ['astro']",
      'coverImage:',
      "  src: './cover.jpg'",
      "  alt: 'Cover alt'",
      '---',
      '',
      'Hello `code`.',
      '',
      '![Cover](./cover.jpg)',
      '',
    ].join('\n'),
  )
  writeFileSync(join(root, 'src/content/posts/hello/cover.jpg'), 'fake-image')
  return root
}

describe('i18n filesystem helpers', () => {
  test('discovers English source files and computes destination paths', () => {
    const root = fixtureRoot()

    try {
      const sources = discoverEnglishSources(root)

      expect(sources).toHaveLength(1)
      expect(sources[0].kind).toBe('post')
      expect(sources[0].slug).toBe('hello')
      expect(destinationFor(sources[0], 'it')).toMatch(
        /src\/content\/posts\/hello\/index\.it\.md$/,
      )
      expect(promptPathFor(sources[0], 'ar')).toMatch(
        /translation-prompts\/ar\/posts\/hello\.prompt\.md$/,
      )
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('builds prompts that preserve structure and name the destination', () => {
    const root = fixtureRoot()

    try {
      const [source] = discoverEnglishSources(root)
      const prompt = buildTranslationPrompt(source, 'zh')

      expect(prompt).toContain('Target language: Chinese')
      expect(prompt).toContain('src/content/posts/hello/index.zh.md')
      expect(prompt).toContain('Return only the translated file content')
      expect(prompt).toContain('```markdown')
      expect(prompt).toContain('Hello `code`.')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('reports missing translations and accepts complete sibling translations', () => {
    const root = fixtureRoot()

    try {
      expect(validateTranslations(root)).toEqual([
        'Missing translation: src/content/posts/hello/index.it.md',
        'Missing translation: src/content/posts/hello/index.ar.md',
        'Missing translation: src/content/posts/hello/index.zh.md',
      ])

      for (const lang of ['it', 'ar', 'zh']) {
        writeFileSync(
          join(root, `src/content/posts/hello/index.${lang}.md`),
          readFileSync(join(root, 'src/content/posts/hello/index.en.md'), 'utf8').replace(
            'Hello',
            `Hello ${lang}`,
          ),
        )
      }

      expect(validateTranslations(root)).toEqual([])
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
```

- [ ] **Step 2: Run failing tests**

Run:

```bash
pnpm run i18n:test
```

Expected: FAIL because `scripts/i18n/shared.ts` does not exist.

- [ ] **Step 3: Implement `scripts/i18n/shared.ts`**

Create `scripts/i18n/shared.ts`:

```ts
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import matter from 'gray-matter'
import {
  defaultLang,
  isLang,
  languageMeta,
  type Lang,
  supportedLangs,
} from '../../src/i18n'

export type ContentKind = 'home' | 'addendum' | 'page' | 'post'
export type TranslationLang = Exclude<Lang, 'en'>

export type SourceFile = {
  sourcePath: string
  relativePath: string
  slug: string
  kind: ContentKind
  extension: '.md' | '.mdx'
  content: string
  data: Record<string, unknown>
}

const contentDir = 'src/content'
const translatableLangs = supportedLangs.filter((lang) => lang !== defaultLang) as TranslationLang[]

function walk(dir: string): string[] {
  if (!existsSync(dir)) return []

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(dir, entry.name)
    return entry.isDirectory() ? walk(entryPath) : [entryPath]
  })
}

function parseKind(relativePath: string): { kind: ContentKind; slug: string } | undefined {
  const parts = relativePath.split(sep)

  if (relativePath === join('home', 'index.en.md') || relativePath === join('home', 'index.en.mdx')) {
    return { kind: 'home', slug: 'home' }
  }

  if (
    relativePath === join('addendum', 'index.en.md') ||
    relativePath === join('addendum', 'index.en.mdx')
  ) {
    return { kind: 'addendum', slug: 'addendum' }
  }

  if (parts[0] === 'pages' && parts.length === 3) {
    return { kind: 'page', slug: parts[1] }
  }

  if (parts[0] === 'posts' && parts.length === 3) {
    return { kind: 'post', slug: parts[1] }
  }

  return undefined
}

export function discoverEnglishSources(rootDir = process.cwd()): SourceFile[] {
  const rootContentDir = join(rootDir, contentDir)

  return walk(rootContentDir)
    .filter((filePath) => /index\.en\.mdx?$/.test(filePath))
    .map((sourcePath) => {
      const relativePath = relative(rootContentDir, sourcePath)
      const parsed = parseKind(relativePath)

      if (!parsed) return undefined

      const content = readFileSync(sourcePath, 'utf8')
      const extension = sourcePath.endsWith('.mdx') ? '.mdx' : '.md'
      const { data } = matter(content)

      return {
        sourcePath,
        relativePath,
        slug: parsed.slug,
        kind: parsed.kind,
        extension,
        content,
        data,
      } satisfies SourceFile
    })
    .filter((source): source is SourceFile => Boolean(source))
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath))
}

export function destinationFor(source: SourceFile, lang: TranslationLang): string {
  if (!isLang(lang) || lang === defaultLang) {
    throw new Error(`Unsupported translation language: ${lang}`)
  }

  return join(dirname(source.sourcePath), `index.${lang}${source.extension}`)
}

export function promptPathFor(source: SourceFile, lang: TranslationLang, rootDir = process.cwd()): string {
  const folder = source.kind === 'post' ? 'posts' : source.kind === 'page' ? 'pages' : source.kind
  return join(rootDir, 'translation-prompts', lang, folder, `${source.slug}.prompt.md`)
}

export function buildTranslationPrompt(source: SourceFile, lang: TranslationLang): string {
  const meta = languageMeta[lang]
  const relativeDestination = relative(process.cwd(), destinationFor(source, lang))

  return [
    `Target language: ${meta.label} (${meta.nativeLabel})`,
    `Target locale: ${meta.locale}`,
    `Text direction: ${meta.dir}`,
    `Expected destination path: ${relativeDestination}`,
    '',
    'Translate the source file below from English into the target language.',
    'Return only the translated file content. Do not wrap the whole answer in Markdown fences. Do not add explanations.',
    '',
    'Rules:',
    '- Translate human-readable prose only.',
    '- Preserve every frontmatter key and data type.',
    '- Preserve Markdown and MDX syntax.',
    '- Preserve code fences, inline code, raw HTML tags, directives, image URLs, local file paths, external URLs, and technical identifiers.',
    '- Preserve the slug and do not rename files.',
    '- Preserve image paths exactly, including relative paths such as ./cover.jpg.',
    '- Keep dates, booleans, arrays, and nested frontmatter objects valid.',
    '',
    'Source file:',
    '```markdown',
    source.content.trimEnd(),
    '```',
    '',
  ].join('\n')
}

function frontmatterKeys(data: Record<string, unknown>): string[] {
  return Object.keys(data).sort()
}

export function validateTranslations(rootDir = process.cwd()): string[] {
  const errors: string[] = []
  const sources = discoverEnglishSources(rootDir)

  for (const source of sources) {
    for (const lang of translatableLangs) {
      const destination = destinationFor(source, lang)
      const relativeDestination = relative(rootDir, destination)

      if (!existsSync(destination)) {
        errors.push(`Missing translation: ${relativeDestination}`)
        continue
      }

      const translatedContent = readFileSync(destination, 'utf8')
      const parsed = matter(translatedContent)
      const sourceKeys = frontmatterKeys(source.data)
      const translatedKeys = frontmatterKeys(parsed.data)

      if (JSON.stringify(sourceKeys) !== JSON.stringify(translatedKeys)) {
        errors.push(
          `Frontmatter keys differ in ${relativeDestination}: expected ${sourceKeys.join(', ')}, received ${translatedKeys.join(', ')}`,
        )
      }

      const localRefs = [...translatedContent.matchAll(/\]\((\.\/[^)\s]+)(?:\s+['"][^'"]+['"])?\)/g)].map(
        (match) => match[1],
      )

      for (const localRef of localRefs) {
        const assetPath = join(dirname(destination), localRef)
        if (!existsSync(assetPath)) {
          errors.push(`Missing local asset referenced by ${relativeDestination}: ${localRef}`)
        }
      }
    }
  }

  return errors
}
```

- [ ] **Step 4: Implement `scripts/i18n/prompts.ts`**

Create `scripts/i18n/prompts.ts`:

```ts
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, relative } from 'node:path'
import { defaultLang, supportedLangs, type Lang } from '../../src/i18n'
import {
  buildTranslationPrompt,
  discoverEnglishSources,
  promptPathFor,
  type TranslationLang,
} from './shared'

const translationLangs = supportedLangs.filter((lang): lang is TranslationLang => lang !== defaultLang)
const sources = discoverEnglishSources(process.cwd())

for (const source of sources) {
  for (const lang of translationLangs) {
    const promptPath = promptPathFor(source, lang)
    mkdirSync(dirname(promptPath), { recursive: true })
    writeFileSync(promptPath, buildTranslationPrompt(source, lang), 'utf8')
    console.log(`Wrote ${relative(process.cwd(), promptPath)}`)
  }
}

console.log(`Generated ${sources.length * translationLangs.length} translation prompts.`)
```

- [ ] **Step 5: Implement `scripts/i18n/validate.ts`**

Create `scripts/i18n/validate.ts`:

```ts
import { validateTranslations } from './shared'

const errors = validateTranslations(process.cwd())

if (errors.length > 0) {
  console.error('i18n validation failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log('i18n validation passed.')
```

- [ ] **Step 6: Run tests and commit**

Run:

```bash
pnpm run i18n:test
```

Expected: PASS for `i18n.test.ts` and `scripts.test.ts`.

Commit:

```bash
git add scripts/i18n/shared.ts scripts/i18n/prompts.ts scripts/i18n/validate.ts test/i18n/scripts.test.ts
git commit -m "feat: add i18n prompt and validation scripts"
```

---

### Task 3: Migrate English Content Into Localized Bundles

**Files:**
- Move: `src/content/home.md` to `src/content/home/index.en.md`
- Move: `src/content/addendum.md` to `src/content/addendum/index.en.md`
- Move: `src/content/posts/showing-off-blog-features/index.md` to `src/content/posts/showing-off-blog-features/index.en.md`
- Move: `src/pages/about.md` to `src/content/pages/about/index.en.md`
- Move: `src/pages/projects.md` to `src/content/pages/projects/index.en.md`
- Existing assets remain in their bundle directories:
  - `src/content/flopp2.jpeg`
  - `src/content/avatar.jpg`
  - `src/content/posts/showing-off-blog-features/cover.jpg`
  - `src/content/posts/showing-off-blog-features/PixelatedGreenTreeSide.png`

**Interfaces:**
- Consumes:
  - Prompt and validation scripts from Task 2.
- Produces:
  - English source content files matching `index.en.md`.
  - Generated prompt files under `translation-prompts/it`, `translation-prompts/ar`, and `translation-prompts/zh`.
  - Translated sibling files matching `index.it.md`, `index.ar.md`, and `index.zh.md`.

- [ ] **Step 1: Move English content with git**

Run:

```bash
mkdir -p src/content/home src/content/addendum src/content/pages/about src/content/pages/projects
git mv src/content/home.md src/content/home/index.en.md
git mv src/content/addendum.md src/content/addendum/index.en.md
git mv src/content/posts/showing-off-blog-features/index.md src/content/posts/showing-off-blog-features/index.en.md
git mv src/pages/about.md src/content/pages/about/index.en.md
git mv src/pages/projects.md src/content/pages/projects/index.en.md
```

Expected: the old page Markdown routes are removed and the English source files are in content bundles.

- [ ] **Step 2: Fix moved relative image paths**

Edit `src/content/home/index.en.md` so the avatar image path changes from:

```yaml
avatarImage:
  src: './flopp2.jpeg'
```

to:

```yaml
avatarImage:
  src: '../flopp2.jpeg'
```

Edit `src/content/addendum/index.en.md` so the avatar image path changes from:

```yaml
avatarImage:
  src: './avatar.jpg'
```

to:

```yaml
avatarImage:
  src: '../avatar.jpg'
```

- [ ] **Step 3: Run prompt generation**

Run:

```bash
pnpm run i18n:prompts
```

Expected: prompt files are written under `translation-prompts/it`, `translation-prompts/ar`, and `translation-prompts/zh`.

- [ ] **Step 4: Create translated sibling files from prompt output**

For each prompt file, paste it into the translation tool of choice and save the returned content to the destination path named inside the prompt. Required destination files:

```text
src/content/home/index.it.md
src/content/home/index.ar.md
src/content/home/index.zh.md
src/content/addendum/index.it.md
src/content/addendum/index.ar.md
src/content/addendum/index.zh.md
src/content/pages/about/index.it.md
src/content/pages/about/index.ar.md
src/content/pages/about/index.zh.md
src/content/pages/projects/index.it.md
src/content/pages/projects/index.ar.md
src/content/pages/projects/index.zh.md
src/content/posts/showing-off-blog-features/index.it.md
src/content/posts/showing-off-blog-features/index.ar.md
src/content/posts/showing-off-blog-features/index.zh.md
```

When saving each translation, preserve all image paths exactly as the prompt instructs.

- [ ] **Step 5: Run validation**

Run:

```bash
pnpm run i18n:validate
```

Expected: PASS after all translated sibling files exist and frontmatter keys match.

- [ ] **Step 6: Commit migrated content and prompts**

Commit:

```bash
git add src/content translation-prompts
git commit -m "feat: migrate content for multilingual translations"
```

---

### Task 4: Update Astro Content Collections And Locale-Aware Helpers

**Files:**
- Modify: `src/content.config.ts`
- Create: `src/content-id.ts`
- Create: `src/content-utils.ts`
- Modify: `src/types.ts`
- Test: `test/i18n/i18n.test.ts`

**Interfaces:**
- Consumes:
  - `Lang` from `src/i18n.ts`.
  - Astro `CollectionEntry`.
- Produces:
  - `parseLocalizedId(id: string): { slug: string; lang: Lang }` from `src/content-id.ts`
  - `getLocalizedCollection<C extends keyof DataEntryMap>(collection: C, lang: Lang): Promise<CollectionEntry<C>[]>`
  - `getLocalizedEntry<C extends keyof DataEntryMap>(collection: C, lang: Lang, slug: string): Promise<CollectionEntry<C> | undefined>`
  - `getLocalizedPage(lang: Lang, slug: 'about' | 'projects'): Promise<CollectionEntry<'pages'> | undefined>`
  - `getSortedPosts(lang: Lang): Promise<CollectionEntry<'posts'>[]>`
  - `SeriesGroup.build(lang: Lang, posts?: CollectionEntry<'posts'>[]): Promise<SeriesGroup>`
  - `TagsGroup.build(lang: Lang, posts?: CollectionEntry<'posts'>[]): Promise<TagsGroup>`

- [ ] **Step 1: Add failing tests for ID parsing**

Add this import near the top of `test/i18n/i18n.test.ts`:

```ts
import { parseLocalizedId } from '../../src/content-id'
```

Then append this block after the existing `describe` blocks:

```ts
describe('localized content ids', () => {
  test('parses Astro content ids with sibling localized files', () => {
    expect(parseLocalizedId('showing-off-blog-features/index.en')).toEqual({
      slug: 'showing-off-blog-features',
      lang: 'en',
    })
    expect(parseLocalizedId('about/index.it')).toEqual({ slug: 'about', lang: 'it' })
  })

  test('rejects unsupported localized ids', () => {
    expect(() => parseLocalizedId('hello/index.de')).toThrow('Unsupported localized content id')
    expect(() => parseLocalizedId('hello')).toThrow('Unsupported localized content id')
  })
})
```

- [ ] **Step 2: Run failing tests**

Run:

```bash
pnpm run i18n:test
```

Expected: FAIL because `src/content-id.ts` does not exist.

- [ ] **Step 3: Update `src/content.config.ts`**

Replace the current collection loaders with localized sibling patterns:

```ts
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const postsCollection = defineCollection({
  loader: glob({ pattern: ['**/index.*.md', '**/index.*.mdx'], base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      published: z.coerce.date(),
      draft: z.boolean().optional().default(false),
      description: z.string().optional(),
      author: z.string().optional(),
      series: z.string().optional(),
      tags: z.array(z.string()).optional().default([]),
      coverImage: z
        .strictObject({
          src: image(),
          alt: z.string(),
        })
        .optional(),
      toc: z.boolean().optional().default(true),
    }),
})

const pagesCollection = defineCollection({
  loader: glob({ pattern: ['**/index.*.md', '**/index.*.mdx'], base: './src/content/pages' }),
  schema: z.object({
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
      githubCalendar: z.string().optional(),
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
}
```

- [ ] **Step 4: Update `src/types.ts` collection types**

Keep existing types and let `pages` be inferred from `DataEntryMap`. No new exported type is required. If TypeScript flags `SiteConfig.giscus` punctuation, keep the existing interface shape and only remove the stray comma after `GiscusConfig | undefined` if the compiler requires it:

```ts
giscus: GiscusConfig | undefined
```

- [ ] **Step 5: Implement `src/content-id.ts`**

Create `src/content-id.ts`:

```ts
import { assertLang, type Lang } from './i18n'

export function parseLocalizedId(id: string): { slug: string; lang: Lang } {
  const match = id.match(/^(?:(.+)\/)?index\.(en|it|ar|zh)$/)

  if (!match) {
    throw new Error(`Unsupported localized content id: ${id}`)
  }

  return {
    slug: match[1] || 'index',
    lang: assertLang(match[2]),
  }
}
```

- [ ] **Step 6: Implement `src/content-utils.ts`**

Create `src/content-utils.ts`:

```ts
import { getCollection, type CollectionEntry } from 'astro:content'
import { slug } from 'github-slugger'
import { parseLocalizedId } from './content-id'
import { routePath, type Lang } from './i18n'
import type { Collation, CollationGroup } from './types'

export { parseLocalizedId } from './content-id'

export async function getLocalizedCollection<C extends 'posts' | 'pages' | 'home' | 'addendum'>(
  collection: C,
  lang: Lang,
): Promise<CollectionEntry<C>[]> {
  const entries = await getCollection(collection, ({ id, data }) => {
    const parsed = parseLocalizedId(id)
    const isDraftPost = collection === 'posts' && 'draft' in data && data.draft === true
    const isVisible = collection !== 'posts' || !import.meta.env.PROD || !isDraftPost
    return parsed.lang === lang && isVisible
  })

  return entries
}

export async function getLocalizedEntry<C extends 'posts' | 'pages' | 'home' | 'addendum'>(
  collection: C,
  lang: Lang,
  slug: string,
): Promise<CollectionEntry<C> | undefined> {
  const entries = await getLocalizedCollection(collection, lang)
  return entries.find((entry) => parseLocalizedId(entry.id).slug === slug)
}

export async function getLocalizedPage(
  lang: Lang,
  slug: 'about' | 'projects',
): Promise<CollectionEntry<'pages'> | undefined> {
  return getLocalizedEntry('pages', lang, slug)
}

export async function getSortedPosts(lang: Lang): Promise<CollectionEntry<'posts'>[]> {
  const posts = await getLocalizedCollection('posts', lang)

  return posts.sort((a, b) => {
    return a.data.published < b.data.published ? -1 : 1
  })
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
    const existing = this.collations.find((entry) => entry.titleSlug === collationTitleSlug)

    if (existing) {
      const alreadyHasThisPost = existing.entries.find((entry) => entry.id === item.id)
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
      if (post.data.series) {
        seriesGroup.add(post, post.data.series)
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
    const tagsGroup = new TagsGroup('Tags', routePath(lang, { type: 'tag', slug: '' }).replace(/\/$/, ''), [])

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
```

- [ ] **Step 7: Update legacy imports**

Any file that imports post helpers from `~/utils` should import them from `~/content-utils` after route files are migrated:

```ts
import { getSortedPosts, SeriesGroup, TagsGroup } from '~/content-utils'
```

Keep theme helpers such as `dateString`, `pick`, and `resolveThemeColorStyles` in `src/utils.ts`.

- [ ] **Step 8: Run tests and commit**

Run:

```bash
pnpm run i18n:test
```

Expected: PASS.

Commit:

```bash
git add src/content.config.ts src/content-id.ts src/content-utils.ts src/types.ts test/i18n/i18n.test.ts
git commit -m "feat: load localized content collections"
```

---

### Task 5: Add Locale-Prefixed Astro Routes

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/pages/[lang]/index.astro`
- Create: `src/pages/[lang]/about.astro`
- Create: `src/pages/[lang]/projects.astro`
- Create: `src/pages/[lang]/posts/[...page].astro`
- Create: `src/pages/[lang]/posts/[slug].astro`
- Create: `src/pages/[lang]/tags/[tag]/[...page].astro`
- Create: `src/pages/[lang]/series/[slug].astro`
- Create: `src/pages/[lang]/rss.xml.ts`
- Delete after equivalents exist: `src/pages/posts/[...page].astro`
- Delete after equivalents exist: `src/pages/posts/[slug].astro`
- Delete after equivalents exist: `src/pages/tags/[tag]/[...page].astro`
- Delete after equivalents exist: `src/pages/series/[slug].astro`
- Delete after equivalents exist: `src/pages/rss.xml.ts`

**Interfaces:**
- Consumes:
  - `supportedLangs`, `assertLang`, `routePath`, `type Lang` from `src/i18n.ts`.
  - `getSortedPosts`, `getLocalizedPage`, `getLocalizedEntry`, `parseLocalizedId`, `SeriesGroup`, `TagsGroup`, `getPostSequenceContext` from `src/content-utils.ts`.
- Produces:
  - Static pages for every supported language.
  - One RSS feed per language.

- [ ] **Step 1: Replace root index with static redirect**

Edit `src/pages/index.astro`:

```astro
---
import { routePath, defaultLang } from '~/i18n'

const destination = routePath(defaultLang, { type: 'home' })
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content={`0; url=${destination}`} />
    <link rel="canonical" href={destination} />
    <title>Redirecting...</title>
  </head>
  <body>
    <a href={destination}>Continue to English site</a>
  </body>
</html>
```

- [ ] **Step 2: Create localized home route**

Create `src/pages/[lang]/index.astro` using the existing home page structure with localized helpers:

```astro
---
import type { GetStaticPaths } from 'astro'
import { getCollection, render } from 'astro:content'
import Layout from '~/layouts/Layout.astro'
import BlockHeader from '~/components/BlockHeader.astro'
import HomeBanner from '~/components/HomeBanner.astro'
import Pagination from '~/components/Pagination.astro'
import PostPreviewCompact from '~/components/PostPreviewCompact.astro'
import { assertLang, routePath, supportedLangs, ui } from '~/i18n'
import { getSortedPosts } from '~/content-utils'

export const getStaticPaths = (() => {
  return supportedLangs.map((lang) => ({ params: { lang } }))
}) satisfies GetStaticPaths

const lang = assertLang(Astro.params.lang!)
const homeEntries = await getCollection('home', ({ id }) => id === `index.${lang}`)
let HomeContent
let homeAvatarImage
let homeGithubCalendar

if (homeEntries.length > 0) {
  const homeEntry = homeEntries[0]
  const { Content } = await render(homeEntry)
  HomeContent = Content
  homeAvatarImage = homeEntry.data.avatarImage
  homeGithubCalendar = homeEntry.data.githubCalendar
}

const sortedPosts = await getSortedPosts(lang)
---

<Layout lang={lang} route={{ type: 'home' }}>
  {
    HomeContent && (
      <HomeBanner avatarImage={homeAvatarImage} githubCalendar={homeGithubCalendar}>
        <HomeContent />
      </HomeBanner>
    )
  }
  {
    sortedPosts.length > 0 && (
      <section>
        <BlockHeader>{ui[lang].articles}</BlockHeader>
        {sortedPosts
          .reverse()
          .slice(0, 10)
          .map((post) => (
            <PostPreviewCompact post={post} lang={lang} />
          ))}
        <Pagination nextLink={routePath(lang, { type: 'posts' })} nextText={ui[lang].navArchive} />
      </section>
    )
  }
</Layout>
```

- [ ] **Step 3: Create localized Markdown page routes**

Create `src/pages/[lang]/about.astro`:

```astro
---
import type { GetStaticPaths } from 'astro'
import { render } from 'astro:content'
import Layout from '~/layouts/Layout.astro'
import { assertLang, supportedLangs } from '~/i18n'
import { getLocalizedPage } from '~/content-utils'

export const getStaticPaths = (() => supportedLangs.map((lang) => ({ params: { lang } }))) satisfies GetStaticPaths

const lang = assertLang(Astro.params.lang!)
const page = await getLocalizedPage(lang, 'about')

if (!page) {
  throw new Error(`Missing localized about page for ${lang}`)
}

const { Content } = await render(page)
---

<Layout lang={lang} route={{ type: 'page', slug: 'about' }} title={page.data.title} description={page.data.description}>
  <div class="max-w-full py-7.5">
    <h1 class="md:mx-2 mb-3 text-[1.75rem] text-heading1 font-semibold"># {page.data.title}</h1>
    <div class="mb-5 prose">
      <Content />
    </div>
  </div>
</Layout>
```

Create `src/pages/[lang]/projects.astro` with the same code and replace both occurrences of `about` with `projects`.

- [ ] **Step 4: Create localized archive route**

Create `src/pages/[lang]/posts/[...page].astro` by adapting the old archive route to use `lang`, `ui[lang]`, and `routePath`:

```astro
---
import type { GetStaticPaths } from 'astro'
import Layout from '~/layouts/Layout.astro'
import Pagination from '~/components/Pagination.astro'
import PostPreviewCompact from '~/components/PostPreviewCompact.astro'
import PageHeader from '~/components/PageHeader.astro'
import siteConfig from '~/site.config'
import { assertLang, supportedLangs, ui } from '~/i18n'
import { getSortedPosts } from '~/content-utils'

export const getStaticPaths = (async ({ paginate }) => {
  const paths = []

  for (const lang of supportedLangs) {
    const sortedPosts = await getSortedPosts(lang)
    paths.push(
      ...paginate(sortedPosts.reverse(), {
        params: { lang },
        pageSize: siteConfig.pageSize,
      }),
    )
  }

  return paths
}) satisfies GetStaticPaths

const lang = assertLang(Astro.params.lang!)
const { page } = Astro.props
const pageTitle = ui[lang].archiveTitle + (page.currentPage > 1 ? ` - Page ${page.currentPage}` : '')
---

<Layout lang={lang} route={{ type: 'posts', page: page.currentPage }} title={pageTitle} description={ui[lang].archiveDescription}>
  <div class="mt-2 sm:mt-0">
    <PageHeader titlePieces={[ui[lang].navArchive]} />
    {page.data.map((post) => <PostPreviewCompact post={post} lang={lang} />)}
    <Pagination
      prevLink={page.url.prev ? page.url.prev : undefined}
      prevText={ui[lang].newerPosts}
      nextLink={page.url.next ? page.url.next : undefined}
      nextText={ui[lang].olderPosts}
    />
  </div>
</Layout>
```

- [ ] **Step 5: Create localized post, tag, series, and RSS routes**

Create each remaining route by copying the existing route behavior and applying these exact substitutions:

```ts
const lang = assertLang(Astro.params.lang!)
```

Use:

```ts
const sortedPosts = await getSortedPosts(lang)
```

Use localized component props:

```astro
<PostPreview post={post} lang={lang} />
<PostPreviewCompact post={post} lang={lang} />
<PostInfo post={post} lang={lang} />
<Tags tags={tags} />
<Layout
  lang={lang}
  route={{ type: 'post', slug: parseLocalizedId(post.id).slug }}
  title={postData.title}
  description={postData.description}
  author={postData.author}
  tags={postData.tags}
>
```

For post links, use:

```ts
routePath(lang, { type: 'post', slug: parseLocalizedId(nextPostInSeries.id).slug })
```

For localized RSS, create `src/pages/[lang]/rss.xml.ts`:

```ts
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import MarkdownIt from 'markdown-it'
import sanitizeHtml from 'sanitize-html'
import { assertLang, routePath } from '~/i18n'
import siteConfig from '~/site.config'
import { getSortedPosts, parseLocalizedId } from '~/content-utils'

const parser = new MarkdownIt()

export async function GET(context: APIContext) {
  const lang = assertLang(context.params.lang!)
  const posts = await getSortedPosts(lang)

  return rss({
    stylesheet: '/rss.xsl',
    title: `${siteConfig.title} (${lang})`,
    description: siteConfig.description,
    site: siteConfig.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.published,
      description: post.data.description,
      author: post.data.author || siteConfig.author,
      link: routePath(lang, { type: 'post', slug: parseLocalizedId(post.id).slug }),
      content: sanitizeHtml(parser.render(post.body || ''), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      }),
    })),
    trailingSlash: false,
  })
}

export function getStaticPaths() {
  return ['en', 'it', 'ar', 'zh'].map((lang) => ({ params: { lang } }))
}
```

- [ ] **Step 6: Remove non-prefixed routes**

After the localized equivalents exist, delete:

```text
src/pages/posts/[...page].astro
src/pages/posts/[slug].astro
src/pages/tags/[tag]/[...page].astro
src/pages/series/[slug].astro
src/pages/rss.xml.ts
```

- [ ] **Step 7: Run validation and commit**

Run:

```bash
pnpm run i18n:validate
pnpm run i18n:test
```

Expected: both PASS.

Commit:

```bash
git add src/pages src/content-utils.ts
git commit -m "feat: add localized Astro routes"
```

---

### Task 6: Localize Layout, Header, Footer, Search, And Post Components

**Files:**
- Modify: `src/layouts/Layout.astro`
- Modify: `src/layouts/MarkdownLayout.astro`
- Modify: `src/components/Header.astro`
- Create: `src/components/LanguageSwitcher.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/components/NavLink.astro`
- Modify: `src/components/Search.astro`
- Modify: `src/components/Pagination.astro`
- Modify: `src/components/PostPreview.astro`
- Modify: `src/components/PostPreviewCompact.astro`
- Modify: `src/components/PostInfo.astro`
- Modify: `src/components/Tags.astro`

**Interfaces:**
- Consumes:
  - `Lang`, `LocalizedRoute`, `languageMeta`, `ui`, `routePath`, `alternateLinks` from `src/i18n.ts`.
- Produces:
  - Layout props include `lang: Lang` and `route: LocalizedRoute`.
  - Header and footer render localized labels.
  - Language switcher links to equivalent localized routes.
  - Post links include language prefixes.

- [ ] **Step 1: Update `Layout.astro` props and HTML attributes**

Modify the props block in `src/layouts/Layout.astro`:

```ts
import {
  alternateLinks,
  languageMeta,
  type Lang,
  type LocalizedRoute,
} from '~/i18n'

interface Props {
  lang: Lang
  route: LocalizedRoute
  title?: string
  description?: string
  tags?: string[]
  author?: string
}

const { lang, route, title, description, tags, author } = Astro.props
const currentLanguage = languageMeta[lang]
const alternates = alternateLinks(route)
```

Change the `<html>` tag to:

```astro
<html
  lang={lang}
  dir={currentLanguage.dir}
  data-theme={defaultTheme}
  data-dark-theme={darkTheme}
  data-light-theme={lightTheme}
  data-theme-mode={themeMode}
  data-theme-hash={themeHash}
>
```

Add alternate links inside `<head>` after canonical:

```astro
{alternates.map((alternate) => (
  <link rel="alternate" hreflang={alternate.lang} href={new URL(alternate.href, Astro.site)} />
))}
```

Render localized chrome:

```astro
<Header lang={lang} route={route} />
<main class="flex flex-col py-1">
  <slot />
</main>
<Footer lang={lang} />
```

- [ ] **Step 2: Create `LanguageSwitcher.astro`**

Create `src/components/LanguageSwitcher.astro`:

```astro
---
import {
  languageMeta,
  routePath,
  supportedLangs,
  ui,
  type Lang,
  type LocalizedRoute,
} from '~/i18n'

interface Props {
  lang: Lang
  route: LocalizedRoute
}

const { lang, route } = Astro.props
---

<label class="sr-only" for="language-switcher">{ui[lang].languageSwitcherLabel}</label>
<select
  id="language-switcher"
  class="bg-background text-accent border-2 rounded-md px-2 py-1"
  aria-label={ui[lang].languageSwitcherLabel}
>
  {
    supportedLangs.map((optionLang) => (
      <option value={routePath(optionLang, route)} selected={optionLang === lang}>
        {languageMeta[optionLang].nativeLabel}
      </option>
    ))
  }
</select>

<script>
  const switcher = document.getElementById('language-switcher') as HTMLSelectElement | null
  switcher?.addEventListener('change', () => {
    window.location.href = switcher.value
  })
</script>
```

- [ ] **Step 3: Update header and nav**

Modify `src/components/Header.astro` props:

```ts
import type { Lang, LocalizedRoute } from '~/i18n'
import { routePath, ui } from '~/i18n'
import LanguageSwitcher from '~/components/LanguageSwitcher.astro'

interface Props {
  lang: Lang
  route: LocalizedRoute
}

const { lang, route } = Astro.props
const text = ui[lang]
const navLinks = [
  { name: text.navHome, url: routePath(lang, { type: 'home' }) },
  { name: text.navAbout, url: routePath(lang, { type: 'page', slug: 'about' }) },
  { name: text.navProjects, url: routePath(lang, { type: 'page', slug: 'projects' }) },
  { name: text.navArchive, url: routePath(lang, { type: 'posts' }) },
  { name: 'GitHub', url: 'https://github.com/fl0wo', external: true },
]
```

Change the logo href:

```astro
href={routePath(lang, { type: 'home' })}
```

Change search and language controls:

```astro
<Search trailingSlashes={siteConfig.trailingSlashes} lang={lang} />
<LanguageSwitcher lang={lang} route={route} />
```

Replace `siteConfig.navLinks.map` with `navLinks.map` in both nav lists.

- [ ] **Step 4: Update footer, search, pagination, and post components**

Apply these exact prop additions:

```ts
// Footer.astro
import { ui, type Lang } from '~/i18n'
interface Props { lang: Lang }
const { lang } = Astro.props
```

Use:

```astro
<span class="my-1">{ui[lang].footerText}</span>
```

```ts
// Search.astro
import { ui, type Lang } from '~/i18n'
const { trailingSlashes = false, lang = 'en' } = Astro.props
const text = ui[lang as Lang]
```

Use `text.openSearch`, `text.searchDialogLabel`, and `text.searchProductionOnly`.

```ts
// PostPreview.astro and PostPreviewCompact.astro
import { routePath, type Lang } from '~/i18n'
import { parseLocalizedId } from '~/content-utils'
interface Props { post: CollectionEntry<'posts'>; lang: Lang }
const articleLink = routePath(lang, { type: 'post', slug: parseLocalizedId(post.id).slug })
```

In `PostPreview.astro`, use `ui[lang].read` and `ui[lang].continueReading`.

```ts
// PostInfo.astro
interface Props { post: CollectionEntry<'posts'>; lang: Lang; class?: string }
const { post, lang, class: className } = Astro.props
const seriesGroup = await SeriesGroup.build(lang)
```

```ts
// Tags.astro
// No lang prop is needed if Collation.url already contains the localized prefix.
```

```ts
// Pagination.astro
// Keep current props, but route files must pass localized labels from ui[lang].
```

- [ ] **Step 5: Run build-oriented checks and commit**

Run:

```bash
pnpm run i18n:test
pnpm run i18n:validate
```

Expected: both PASS.

Commit:

```bash
git add src/layouts src/components
git commit -m "feat: localize site chrome and links"
```

---

### Task 7: Wire SEO, Root Redirect, Pagefind, README, And Build Verification

**Files:**
- Modify: `src/layouts/Layout.astro`
- Modify: `src/pages/robots.txt.ts`
- Modify: `src/pages/404.astro`
- Modify: `README.md`
- Modify: `src/components/Search.astro`

**Interfaces:**
- Consumes:
  - `routePath`, `defaultLang`, `supportedLangs`, `languageMeta`.
- Produces:
  - Localized canonical and `hreflang` metadata.
  - A documented content workflow.
  - Build output under `dist/en`, `dist/it`, `dist/ar`, and `dist/zh`.

- [ ] **Step 1: Confirm layout canonical and social URLs are localized**

In `src/layouts/Layout.astro`, keep:

```ts
const pageUrl = new URL(Astro.url.pathname, Astro.site).href.replace(/\/$/, '')
```

Change article detection:

```ts
const pageType = /^\/(en|it|ar|zh)\/posts\//.test(Astro.url.pathname) ? 'article' : 'website'
```

Change social card path to avoid generating invalid localized card URLs while cards are disabled:

```ts
const pageImage = `${Astro.url.origin}/social-cards/__default.png`
```

- [ ] **Step 2: Localize 404 enough to keep layout valid**

Modify `src/pages/404.astro`:

```astro
---
import Layout from '~/layouts/Layout.astro'
---

<Layout lang="en" route={{ type: 'home' }} title="404">
  <h1 class="inline-block m-auto p-4 text-accent text-4xl">404</h1>
</Layout>
```

- [ ] **Step 3: Keep robots route valid**

Open `src/pages/robots.txt.ts`. If it references only `Astro.site` or static sitemap paths, leave behavior unchanged. If it hardcodes `/posts`, replace any public content route references with `/en/posts`.

- [ ] **Step 4: Add README workflow**

Append to `README.md`:

```md
## Multilingual Content Workflow

English is the source of truth. Edit only the `.en.md` or `.en.mdx` files under `src/content`.

To update translations:

1. Run `pnpm run i18n:prompts`.
2. Open the generated files under `translation-prompts/`.
3. Paste each prompt into your translation tool.
4. Save the returned file content to the destination path named in the prompt.
5. Run `pnpm run i18n:validate`.
6. Run `pnpm build`.

The site publishes language-prefixed routes for English, Italian, Arabic, and Chinese:

- `/en/`
- `/it/`
- `/ar/`
- `/zh/`
```

- [ ] **Step 5: Run full verification**

Run:

```bash
pnpm run i18n:test
pnpm run i18n:validate
pnpm build
```

Expected:

```text
PASS test/i18n/i18n.test.ts
PASS test/i18n/scripts.test.ts
i18n validation passed.
```

And Astro build completes with Pagefind postbuild.

- [ ] **Step 6: Inspect built output**

Run:

```bash
test -f dist/en/index.html
test -f dist/it/index.html
test -f dist/ar/index.html
test -f dist/zh/index.html
test -f dist/en/posts/showing-off-blog-features/index.html
test -f dist/it/posts/showing-off-blog-features/index.html
grep -q 'lang="ar"' dist/ar/index.html
grep -q 'dir="rtl"' dist/ar/index.html
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit final integration**

Commit:

```bash
git add README.md src/layouts/Layout.astro src/pages/404.astro src/pages/robots.txt.ts src/components/Search.astro
git commit -m "docs: document multilingual content workflow"
```

---

### Task 8: Final Review And Cleanup

**Files:**
- Review: `git status --short`
- Review: `translation-prompts/**`
- Review: `src/content/**/index.*.md`
- Review: `src/pages/[lang]/**`

**Interfaces:**
- Consumes:
  - All tasks above.
- Produces:
  - Verified working multilingual static site.

- [ ] **Step 1: Check for stale root-relative public content links**

Run:

```bash
rg -n 'href="/(posts|tags|series|about|projects)|/posts/|/tags/|/series/' src
```

Expected: no stale non-localized internal content links remain, except strings inside `routePath` tests or prompt text.

- [ ] **Step 2: Check for old content files**

Run:

```bash
test ! -f src/content/home.md
test ! -f src/content/addendum.md
test ! -f src/pages/about.md
test ! -f src/pages/projects.md
test ! -f src/content/posts/showing-off-blog-features/index.md
```

Expected: all commands exit 0.

- [ ] **Step 3: Run final verification**

Run:

```bash
pnpm run i18n:test
pnpm run i18n:validate
pnpm build
git status --short
```

Expected:

```text
PASS
i18n validation passed.
```

`git status --short` may show unrelated pre-existing files such as `.astro/content-assets.mjs`, `.astro/settings.json`, and `AGENTS.md`; do not revert or stage those unless the user explicitly asks.

- [ ] **Step 4: Final commit if cleanup changed files**

If Task 8 changed tracked implementation files, commit them:

```bash
git add src README.md package.json pnpm-lock.yaml scripts test translation-prompts
git commit -m "chore: verify multilingual site integration"
```

If Task 8 did not change files, do not create an empty commit.

---

## Self-Review

- Spec coverage: Tasks cover language-prefixed routes, stable slugs, sibling localized content, prompt generation, validation, Arabic RTL, SEO alternates, RSS per language, search labels, README workflow, and build verification.
- Open-ended instruction scan: The only external content step is explicit: generated prompts are pasted into a translation tool and saved to concrete destination files.
- Type consistency: `Lang`, `LocalizedRoute`, `routePath`, `alternateLinks`, `parseLocalizedId`, `getSortedPosts`, `SeriesGroup`, and `TagsGroup` are defined before later tasks consume them.
