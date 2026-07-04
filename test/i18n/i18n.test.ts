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
import { parseLocalizedId } from '../../src/content-id'

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

describe('localized content ids', () => {
  test('parses Astro content ids with sibling localized files', () => {
    expect(parseLocalizedId('showing-off-blog-features/index.en')).toEqual({
      slug: 'showing-off-blog-features',
      lang: 'en',
    })
    expect(parseLocalizedId('about/index.it')).toEqual({ slug: 'about', lang: 'it' })
    expect(parseLocalizedId('index.ar')).toEqual({ slug: 'index', lang: 'ar' })
    expect(parseLocalizedId('showing-off-blog-features/indexzh')).toEqual({
      slug: 'showing-off-blog-features',
      lang: 'zh',
    })
  })

  test('rejects unsupported localized ids', () => {
    expect(() => parseLocalizedId('hello/index.de')).toThrow('Unsupported localized content id')
    expect(() => parseLocalizedId('hello')).toThrow('Unsupported localized content id')
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
