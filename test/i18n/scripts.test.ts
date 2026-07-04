import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
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

function legacySourceFixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'fl0wo-i18n-'))

  mkdirSync(join(root, 'src/content'), { recursive: true })
  mkdirSync(join(root, 'src/content/posts/hello'), { recursive: true })
  mkdirSync(join(root, 'src/pages'), { recursive: true })

  writeFileSync(
    join(root, 'src/content/home.md'),
    [
      '---',
      'title: Home',
      'avatarImage:',
      "  src: './flopp2.jpeg'",
      "  alt: 'Florian'",
      '---',
      '',
      'Welcome home.',
    ].join('\n'),
  )
  writeFileSync(join(root, 'src/content/flopp2.jpeg'), 'fake-image')

  writeFileSync(
    join(root, 'src/content/addendum.md'),
    [
      '---',
      'title: Addendum',
      'avatarImage:',
      "  src: './avatar.jpg'",
      "  alt: 'Avatar'",
      '---',
      '',
      'Thanks for reading.',
    ].join('\n'),
  )
  writeFileSync(join(root, 'src/content/avatar.jpg'), 'fake-image')

  writeFileSync(
    join(root, 'src/content/posts/hello/index.md'),
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

  writeFileSync(
    join(root, 'src/pages/about.md'),
    [
      '---',
      'title: About',
      '---',
      '',
      'About page body',
    ].join('\n'),
  )

  writeFileSync(
    join(root, 'src/pages/projects.md'),
    [
      '---',
      'title: Projects',
      '---',
      '',
      'Projects page body',
    ].join('\n'),
  )

  return root
}

function futureSourceFixtureRoot(): string {
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

function futureLocalizedContentFixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'fl0wo-i18n-'))
  mkdirSync(join(root, 'src/content/home'), { recursive: true })
  mkdirSync(join(root, 'src/content/addendum'), { recursive: true })
  mkdirSync(join(root, 'src/content/pages/about'), { recursive: true })

  writeFileSync(
    join(root, 'src/content/home/index.en.md'),
    [
      '---',
      'title: Welcome',
      'avatarImage:',
      "  src: './flopp2.jpeg'",
      "  alt: 'Florian'",
      '---',
      '',
      'Welcome from future home.',
    ].join('\n'),
  )
  writeFileSync(join(root, 'src/content/flopp2.jpeg'), 'fake-image')

  writeFileSync(
    join(root, 'src/content/addendum/index.en.md'),
    [
      '---',
      'title: Addendum Future',
      'avatarImage:',
      "  src: './avatar.jpg'",
      "  alt: 'Avatar'",
      '---',
      '',
      'Future addendum source.',
    ].join('\n'),
  )
  writeFileSync(join(root, 'src/content/avatar.jpg'), 'fake-image')

  writeFileSync(
    join(root, 'src/content/pages/about/index.en.md'),
    [
      '---',
      'title: About',
      '---',
      '',
      'Future about page source.',
    ].join('\n'),
  )

  return root
}

function legacyTranslatedFixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'fl0wo-i18n-'))
  mkdirSync(join(root, 'src/content'), { recursive: true })
  mkdirSync(join(root, 'src/content/home'), { recursive: true })
  mkdirSync(join(root, 'src/content/addendum'), { recursive: true })

  writeFileSync(
    join(root, 'src/content/home.md'),
    [
      '---',
      'title: Home',
      'avatarImage:',
      "  src: './flopp2.jpeg'",
      "  alt: 'Florian'",
      '---',
      '',
      'Welcome home.',
    ].join('\n'),
  )
  writeFileSync(join(root, 'src/content/flopp2.jpeg'), 'fake-image')

  writeFileSync(
    join(root, 'src/content/addendum.md'),
    [
      '---',
      'title: Addendum',
      'avatarImage:',
      "  src: './avatar.jpg'",
      "  alt: 'Avatar'",
      '---',
      '',
      'Thanks for reading.',
    ].join('\n'),
  )
  writeFileSync(join(root, 'src/content/avatar.jpg'), 'fake-image')

  for (const lang of ['it', 'ar', 'zh']) {
    writeFileSync(
      join(root, `src/content/home/index.${lang}.md`),
      [
        '---',
        'title: Home',
        'avatarImage:',
        "  src: '../flopp2.jpeg'",
        "  alt: 'Florian'",
        '---',
        '',
        `Benvenuto ${lang}.`,
      ].join('\n'),
    )
  }

  for (const lang of ['it', 'ar', 'zh']) {
    writeFileSync(
      join(root, `src/content/addendum/index.${lang}.md`),
      [
        '---',
        'title: Addendum',
        'avatarImage:',
        "  src: '../avatar.jpg'",
        "  alt: 'Avatar'",
        '---',
        '',
        `Grazie ${lang}.`,
      ].join('\n'),
    )
  }

  return root
}

function validationIssueFixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'fl0wo-i18n-'))
  mkdirSync(join(root, 'src/content/posts/hello'), { recursive: true })
  mkdirSync(join(root, 'src/pages'), { recursive: true })

  writeFileSync(
    join(root, 'src/content/posts/hello/index.md'),
    [
      '---',
      'title: Hello',
      'coverImage:',
      "  src: './cover.jpg'",
      "  alt: 'Cover alt'",
      '---',
      '',
      'Hello source',
    ].join('\n'),
  )
  writeFileSync(join(root, 'src/content/posts/hello/cover.jpg'), 'fake-image')

  writeFileSync(
    join(root, 'src/content/posts/hello/index.de.md'),
    [
      '---',
      'title: Hallo',
      'coverImage:',
      "  src: './cover.jpg'",
      "  alt: 'Cover alt'",
      '---',
      '',
      'Hallo source',
    ].join('\n'),
  )

  writeFileSync(
    join(root, 'src/content/posts/hello/index.it.md'),
    [
      '---',
      'title: Ciao',
      'coverImage:',
      "  src: './missing-cover.jpg'",
      "  alt: 'Cover alt'",
      '---',
      '',
      'Ciao source',
    ].join('\n'),
  )

  writeFileSync(
    join(root, 'src/content/posts/hello/index.ar.md'),
    [
      '---',
      'title: مرحبا',
      'coverImage:',
      "  src: './cover.jpg'",
      "  alt: 'Cover alt'",
      '---',
      '',
      'مرحبا',
    ].join('\n'),
  )

  writeFileSync(
    join(root, 'src/pages/faq.md'),
    [
      '---',
      'title: FAQ',
      '---',
      '',
      'Frequently asked questions.',
    ].join('\n'),
  )

  return root
}

function malformedTranslatedFrontmatterFixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'fl0wo-i18n-'))
  mkdirSync(join(root, 'src/content/posts/hello'), { recursive: true })
  writeFileSync(
    join(root, 'src/content/posts/hello/index.md'),
    [
      '---',
      'title: Hello',
      'coverImage:',
      "  src: './cover.jpg'",
      "  alt: 'Cover alt'",
      '---',
      '',
      'Hello source.',
    ].join('\n'),
  )
  writeFileSync(join(root, 'src/content/posts/hello/index.it.md'), [
    '---',
    'title: Ciao',
    'coverImage: [broken',
    '  src: ./cover.jpg',
    '---',
    '',
    'Ciao',
  ].join('\n'))

  return root
}

function malformedSourceFrontmatterFixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'fl0wo-i18n-'))
  mkdirSync(join(root, 'src/content/posts/hello'), { recursive: true })
  writeFileSync(
    join(root, 'src/content/posts/hello/index.md'),
    [
      '---',
      'title: Broken',
      'tags: [',
      '  - one',
      '---',
      '',
      'Broken source.',
    ].join('\n'),
  )

  return root
}

function routeLayoutMismatchFixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'fl0wo-i18n-'))
  mkdirSync(join(root, 'src/content/posts/hello'), { recursive: true })
  mkdirSync(join(root, 'src/content/wrong-slug'), { recursive: true })
  writeFileSync(
    join(root, 'src/content/posts/hello/index.md'),
    [
      '---',
      'title: Hello',
      'coverImage:',
      "  src: './cover.jpg'",
      "  alt: 'Cover alt'",
      '---',
      '',
      'Hello source',
    ].join('\n'),
  )
  writeFileSync(join(root, 'src/content/posts/hello/cover.jpg'), 'fake-image')
  writeFileSync(
    join(root, 'src/content/wrong-slug/index.it.md'),
    [
      '---',
      'title: Wrong',
      'coverImage:',
      "  src: './cover.jpg'",
      "  alt: 'Cover alt'",
      '---',
      '',
      'Wrong path',
    ].join('\n'),
  )

  return root
}

describe('i18n filesystem helpers', () => {
  test('discovers legacy home/addendum/pages/posts and maps future content to stable destinations', () => {
    const root = legacySourceFixtureRoot()

    try {
      const sources = discoverEnglishSources(root)

      expect(sources).toHaveLength(5)
      const byKind = new Map(sources.map((source) => [`${source.kind}:${source.slug}`, source]))

      expect(byKind.get('home:home')?.kind).toBe('home')
      expect(destinationFor(byKind.get('home:home')!, 'it', root)).toMatch(/src\/content\/home\/index\.it\.md$/)

      expect(byKind.get('addendum:addendum')?.kind).toBe('addendum')
      expect(destinationFor(byKind.get('addendum:addendum')!, 'it', root)).toMatch(
        /src\/content\/addendum\/index\.it\.md$/,
      )

      expect(byKind.get('post:hello')?.kind).toBe('post')
      expect(destinationFor(byKind.get('post:hello')!, 'ar', root)).toMatch(/src\/content\/posts\/hello\/index\.ar\.md$/)

      expect(byKind.get('page:about')?.kind).toBe('page')
      expect(byKind.get('page:projects')?.kind).toBe('page')
      expect(promptPathFor(byKind.get('page:about')!, 'zh', root)).toMatch(
        /translation-prompts\/zh\/pages\/about\.prompt\.md$/,
      )
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('builds prompts with deterministic root-relative destination paths', () => {
    const root = futureSourceFixtureRoot()

    try {
      const [source] = discoverEnglishSources(root)
      const prompt = buildTranslationPrompt(source, 'zh', root)

      expect(prompt).toContain('Target language: Chinese')
      expect(prompt).toContain('src/content/posts/hello/index.zh.md')
      expect(prompt).toContain('Return only the translated file content')
      expect(prompt).toContain('```markdown')
      expect(prompt).toContain('Hello `code`.')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('rewrites legacy frontmatter asset paths in legacy prompt fixtures', () => {
    const root = legacySourceFixtureRoot()

    try {
      const sources = discoverEnglishSources(root)
      const byKind = new Map(sources.map((source) => [`${source.kind}:${source.slug}`, source]))

      const homePrompt = buildTranslationPrompt(byKind.get('home:home')!, 'it', root)
      const addendumPrompt = buildTranslationPrompt(byKind.get('addendum:addendum')!, 'it', root)

      expect(homePrompt).toContain('../flopp2.jpeg')
      expect(homePrompt).not.toContain("src: './flopp2.jpeg'")
      expect(addendumPrompt).toContain('../avatar.jpg')
      expect(addendumPrompt).not.toContain("src: './avatar.jpg'")
      expect(homePrompt).toContain('Target language: Italian')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('keeps future localized source paths unchanged for prompt generation', () => {
    const root = futureLocalizedContentFixtureRoot()

    try {
      const sources = discoverEnglishSources(root)
      const byKind = new Map(sources.map((source) => [`${source.kind}:${source.slug}`, source]))

      const homePrompt = buildTranslationPrompt(byKind.get('home:home')!, 'zh', root)
      const addendumPrompt = buildTranslationPrompt(byKind.get('addendum:addendum')!, 'zh', root)

      expect(homePrompt).toContain("src: './flopp2.jpeg'")
      expect(addendumPrompt).toContain("src: './avatar.jpg'")
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('discovers future localized page/home/addendum content sources', () => {
    const root = futureLocalizedContentFixtureRoot()

    try {
      const sources = discoverEnglishSources(root)
      const byKind = new Map(sources.map((source) => [`${source.kind}:${source.slug}`, source]))

      expect(byKind.get('page:about')?.kind).toBe('page')
      expect(destinationFor(byKind.get('page:about')!, 'it', root)).toMatch(/src\/content\/pages\/about\/index\.it\.md$/)

      expect(byKind.get('home:home')?.kind).toBe('home')
      expect(destinationFor(byKind.get('home:home')!, 'it', root)).toMatch(/src\/content\/home\/index\.it\.md$/)

      expect(byKind.get('addendum:addendum')?.kind).toBe('addendum')
      expect(destinationFor(byKind.get('addendum:addendum')!, 'it', root)).toMatch(
        /src\/content\/addendum\/index\.it\.md$/,
      )
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('reports missing translations and validates when all files are present', () => {
    const root = futureSourceFixtureRoot()

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

  test('validates unsupported locale translations, frontmatter assets, and unsupported page slugs', () => {
    const root = validationIssueFixtureRoot()

    try {
      const errors = validateTranslations(root)

      expect(errors).toContain('Unsupported translation language in src/content/posts/hello/index.de.md: de')
      expect(errors).toContain(
        'Missing coverImage.src referenced by src/content/posts/hello/index.it.md: ./missing-cover.jpg',
      )
      expect(errors).toContain('Unsupported page slug at src/pages/faq.md: faq')
      expect(errors).toContain('Missing translation: src/content/pages/faq/index.it.md')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('validates legacy home/addendum translated assets when rewritten correctly', () => {
    const root = legacyTranslatedFixtureRoot()

    try {
      expect(validateTranslations(root)).toEqual([])
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('reports malformed translated frontmatter without throwing', () => {
    const root = malformedTranslatedFrontmatterFixtureRoot()

    try {
      const errors = validateTranslations(root)

      expect(errors).toContainEqual(expect.stringContaining('Malformed translated frontmatter in src/content/posts/hello/index.it.md'))
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('handles malformed source frontmatter without crashing', () => {
    const root = malformedSourceFrontmatterFixtureRoot()

    try {
      const errors = validateTranslations(root)

      expect(errors).toContainEqual(
        expect.stringContaining('Malformed source frontmatter in src/content/posts/hello/index.md'),
      )
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('validates route and layout mismatches for translated files', () => {
    const root = routeLayoutMismatchFixtureRoot()

    try {
      const errors = validateTranslations(root)
      expect(errors).toContain(
        'Route/layout mismatch for translation path: expected translated files in source-mapped directories, found src/content/wrong-slug/index.it.md',
      )
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
