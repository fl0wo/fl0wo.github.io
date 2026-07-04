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
      expect(destinationFor(sources[0], 'it')).toMatch(/src\/content\/posts\/hello\/index\.it\.md$/)
      expect(promptPathFor(sources[0], 'ar')).toMatch(/translation-prompts\/ar\/posts\/hello\.prompt\.md$/)
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
