# Multilingual Site Design

## Context

The site is an Astro static site with Markdown and MDX content collections for home content, addendum content, and blog posts. Standalone Markdown pages currently live directly in `src/pages` for `/about` and `/projects`, and blog routes live under `/posts`, `/tags`, and `/series`.

The goal is to make every public page available in English, Italian, Arabic, and Chinese while keeping English as the only content the site owner edits by hand. Non-English content should be generated from English through copy-pasteable prompt files, then committed as generated translation artifacts.

## Goals

- Publish language-prefixed static routes for every public page:
  - `/en/`, `/it/`, `/ar/`, `/zh/`
  - `/en/about`, `/it/about`, `/ar/about`, `/zh/about`
  - `/en/projects`, `/it/projects`, `/ar/projects`, `/zh/projects`
  - `/en/posts`, `/it/posts`, `/ar/posts`, `/zh/posts`
  - `/en/posts/<slug>`, `/it/posts/<slug>`, `/ar/posts/<slug>`, `/zh/posts/<slug>`
  - localized tag and series index routes.
- Keep canonical slugs stable across languages so translated variants of a post share the same slug.
- Keep English Markdown and MDX as the source of truth.
- Generate prompt files that can be pasted into any translation tool.
- Preserve Markdown, MDX, frontmatter, code fences, directives, links, images, raw HTML, and technical identifiers during translation.
- Provide a validation path that catches broken translated frontmatter, missing translations, invalid languages, missing assets, and route mismatches.
- Support Arabic right-to-left rendering through correct `html lang` and `dir` attributes.
- Keep the site statically generated and compatible with the current Cloudflare/static deployment flow.

## Non-Goals

- Do not call translation APIs directly in the first implementation.
- Do not translate slugs in the first implementation.
- Do not introduce a CMS.
- Do not make translations happen client-side at runtime.
- Do not require the owner to maintain non-English files manually, beyond reviewing and committing generated translations.

## Supported Languages

The supported language codes are:

- `en`: English, left-to-right, default language.
- `it`: Italian, left-to-right.
- `ar`: Arabic, right-to-left.
- `zh`: Chinese, left-to-right.

The default language is `en`. The root route `/` should send visitors to `/en/` using a static redirect page or Astro redirect, depending on what works best with the static output mode.

## Architecture

Use a build-time multilingual architecture. The site will have locale-prefixed Astro routes, an i18n helper module, locale-aware content helpers, and generated localized content files.

English source content should use `.en.md` or `.en.mdx` files. Non-English generated translations should live beside the English source as sibling files:

- `src/content/home/index.en.md`
- `src/content/home/index.it.md`
- `src/content/home/index.ar.md`
- `src/content/home/index.zh.md`
- `src/content/addendum/index.en.md`
- `src/content/posts/<slug>/index.en.md`
- `src/content/posts/<slug>/index.it.md`
- `src/content/posts/<slug>/index.ar.md`
- `src/content/posts/<slug>/index.zh.md`
- `src/content/pages/about/index.en.md`
- `src/content/pages/about/index.it.md`
- `src/content/pages/projects/index.en.md`

Post, page, home, and addendum assets should remain in the same content bundle directory as the sibling localized files. This avoids copying binary files per language and lets every translation preserve relative image paths such as `./cover.jpg`.

## Routing

Replace public routes with locale-prefixed routes:

- `src/pages/[lang]/index.astro`
- `src/pages/[lang]/about.astro`
- `src/pages/[lang]/projects.astro`
- `src/pages/[lang]/posts/[...page].astro`
- `src/pages/[lang]/posts/[slug].astro`
- `src/pages/[lang]/tags/[tag]/[...page].astro`
- `src/pages/[lang]/series/[slug].astro`

Each route must validate `lang` against the supported language list in `getStaticPaths`. Unknown language codes should not produce pages.

Existing non-prefixed public content routes should be removed or converted to redirects so duplicate content does not remain indexed.

## Content Model

Content helpers should expose locale-aware accessors:

- `getLocalizedEntry(collection, lang, id)`
- `getLocalizedPosts(lang)`
- `getSortedPosts(lang)`
- `getLocalizedPage(lang, slug)`
- `getFallbackLang(lang)` only if a future fallback mode is explicitly added.

The first implementation should require translated files for `it`, `ar`, and `zh` once multilingual mode is enabled. Missing translated content should fail validation instead of silently falling back to English, because silent fallback creates partially translated pages and weak SEO signals.

Post identity should be based on the content bundle folder name. The translated post for `src/content/posts/showing-off-blog-features/index.it.md` corresponds to the English post at `src/content/posts/showing-off-blog-features/index.en.md`. This keeps language switching and alternate links deterministic.

## Site Chrome Translations

Site UI text should live in a typed dictionary, likely `src/i18n.ts` or `src/i18n/ui.ts`.

The dictionary should include at least:

- Navigation labels: Home, About, Projects, Archive.
- Section labels: Articles, Series, Tags, More Posts, Comments.
- Pagination labels: Previous, Next, Newer Posts, Older Posts.
- Post action labels: Read, Continue, Next.
- Search labels: Open Search, search dialog label, production-only search message.
- Footer text.
- SEO descriptions for generated list pages.
- Language switcher labels.

External URLs such as GitHub and social links remain language-neutral.

## Language Switcher

Add a compact language switcher in the header. It should link to the equivalent route in each supported language:

- On `/en/posts/foo`, Italian links to `/it/posts/foo`.
- On `/en/about`, Arabic links to `/ar/about`.
- On paginated archives, switch to the equivalent page number if it exists.
- On tag and series pages, switch to the same stable tag or series slug.

If an equivalent route cannot exist because validation has failed, the site should not build. The UI does not need a runtime missing-translation state for the first implementation.

## SEO, Metadata, And Feeds

The layout should set:

- `<html lang="...">`
- `<html dir="rtl">` for Arabic and `ltr` for the other supported languages.
- A localized canonical URL matching the current localized route.
- `hreflang` alternate links for all supported language variants.
- `x-default` pointing to `/en/...`.

Metadata should use localized title, description, tags, and author when content provides them. Site-wide metadata such as the site title and owner name can remain unchanged unless the dictionary provides a translation.

RSS should produce one feed per language, such as `/en/rss.xml`, `/it/rss.xml`, `/ar/rss.xml`, and `/zh/rss.xml`, because the route model is language-prefixed everywhere else.

Social card generation is currently disabled and returns 404. The multilingual implementation only needs to make sure disabled social card routes do not break localized metadata. If social cards are re-enabled later, they should be generated per language.

## Search

Pagefind runs after the static build. The implementation should keep Pagefind compatible with localized URLs.

The first implementation may use a single Pagefind index across all languages. If this causes noisy mixed-language search results, a follow-up can split indexes by language. Search UI labels should be localized immediately.

## Translation Prompt Generation

Add a script that scans English source files and creates prompt files under a generated directory such as:

- `translation-prompts/it/pages/about.prompt.md`
- `translation-prompts/ar/pages/about.prompt.md`
- `translation-prompts/zh/pages/about.prompt.md`
- `translation-prompts/it/posts/showing-off-blog-features.prompt.md`

Each prompt file should include:

- The target language and locale rules.
- Instructions to translate human-readable prose only.
- Instructions to preserve frontmatter keys and data types.
- Instructions to preserve Markdown syntax, code fences, inline code, raw HTML tags, Astro/MDX syntax, directives, image URLs, local file paths, external URLs, and technical identifiers.
- Instructions to preserve the slug and output path.
- The exact source content.
- The exact expected destination path for the translated output.

The prompt should ask the translation tool to return only the translated file content, not explanations or Markdown wrappers around the whole response.

The script should be deterministic and safe to rerun. It may overwrite generated prompt files.

## Translation Import Workflow

The owner workflow should be:

1. Edit English content only.
2. Run `pnpm run i18n:prompts`.
3. Paste each generated prompt into a translation tool.
4. Save each returned translation to the destination path named in the prompt.
5. Run `pnpm run i18n:validate`.
6. Run `pnpm build`.

The implementation can add a lightweight README section describing this workflow.

## Validation

Add validation that checks:

- Every English source page has `it`, `ar`, and `zh` translated counterparts.
- Every translated file keeps the same required frontmatter keys as English.
- Frontmatter parses correctly.
- `title`, `description`, `tags`, `series`, `coverImage`, `published`, `draft`, and `toc` remain valid when present.
- Slugs match between English and translated files.
- Local image/file references still point to existing files.
- Supported language codes are exactly `en`, `it`, `ar`, and `zh`.
- Arabic routes receive `dir="rtl"` in rendered output or through a unit/integration check.

Validation should fail loudly and explain the exact file/path that needs attention.

## Testing

Because this is a behavior change, use test-first implementation for pure helper functions and validation logic.

Core tests should cover:

- Language detection and validation.
- Localized URL generation.
- Equivalent-language URL generation for home, pages, posts, tags, series, RSS, and paginated archives.
- UI dictionary completeness for all supported languages.
- Content validation errors for missing translations and malformed frontmatter.
- Route generation includes only supported language codes.

End-to-end verification should include:

- `pnpm build`.
- Checking built output has `/en/`, `/it/`, `/ar/`, `/zh/`.
- Checking at least one built Arabic page has `lang="ar"` and `dir="rtl"`.
- Checking one post exists at the same slug across all languages.

## Migration Plan

The implementation should migrate current content without losing history or assets:

- Move existing `src/content/home.md` to the English source location.
- Move existing `src/content/addendum.md` to the English source location.
- Move existing `src/content/posts/...` to the English source location.
- Convert `src/pages/about.md` and `src/pages/projects.md` into English source content.
- Replace old Markdown page routes with localized Astro routes that render localized page content through the shared Markdown layout style.
- Generate initial prompt files for Italian, Arabic, and Chinese.

The first implementation does not need to produce high-quality non-English translations itself. It should require the owner to paste generated prompts and save the resulting files before production validation passes. Test-only fixtures may use obviously fake translated prose inside a test fixture directory, but generated production content should not include fake translations.

## Open Decisions Resolved

- Translation API integration: not included. The script generates prompt files for copy-paste use.
- URL shape: language prefix for all languages, including English.
- Slugs: stable English slugs across all languages.
- Missing translation behavior: fail validation instead of silently falling back.
- Arabic direction: first-class RTL through `dir="rtl"`.
