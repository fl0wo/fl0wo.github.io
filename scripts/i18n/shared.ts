import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, join, relative, sep } from 'node:path'
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
  frontmatterError?: string
}

const contentDir = 'src/content'
const pagesDir = 'src/pages'
const translatableLangs = supportedLangs.filter((lang) => lang !== defaultLang) as TranslationLang[]
const supportedPages = new Set(['about', 'projects'])
const translationFilePattern = /^index\.([^.]+)\.(mdx?)$/

function walk(dir: string): string[] {
  if (!existsSync(dir)) return []

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(dir, entry.name)
    return entry.isDirectory() ? walk(entryPath) : [entryPath]
  })
}

type ParsedMarkdown = {
  content: string
  data: Record<string, unknown>
  frontmatterError?: string
}

function extractFrontmatterSection(content: string): string | null {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)

  if (!frontmatterMatch) {
    if (content.startsWith('---')) {
      return ''
    }

    return null
  }

  return frontmatterMatch[1]
}

function hasFrontmatterContent(frontmatterText: string): boolean {
  return frontmatterText
    .split(/\r?\n/)
    .some((line) => {
      const trimmed = line.trim()
      return trimmed !== '' && !trimmed.startsWith('#')
    })
}

function parseMarkdown(sourcePath: string): ParsedMarkdown {
  const content = readFileSync(sourcePath, 'utf8')
  const frontmatterSection = extractFrontmatterSection(content)

  try {
    const { data } = matter(content)
    if (frontmatterSection === '') {
      return {
        content,
        data: {},
        frontmatterError: 'Unable to parse frontmatter: missing closing --- delimiter',
      }
    }

    if (Object.keys(data).length === 0 && frontmatterSection !== null && hasFrontmatterContent(frontmatterSection)) {
      return {
        content,
        data: {},
        frontmatterError: 'Unable to parse frontmatter block',
      }
    }

    return { content, data: data as Record<string, unknown> }
  } catch (error) {
    return {
      content,
      data: {},
      frontmatterError: error instanceof Error ? error.message : String(error),
    }
  }
}

function rewriteLegacyFrontmatterAssetRefs(data: Record<string, unknown>): Record<string, unknown> {
  const keys = ['coverImage', 'avatarImage']
  const rewritten = { ...data }

  for (const key of keys) {
    const value = rewritten[key]
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      continue
    }

    const block = { ...(value as Record<string, unknown>) }
    const src = block.src

    if (typeof src === 'string' && src.startsWith('./')) {
      block.src = `../${src.slice(2)}`
    }

    rewritten[key] = block
  }

  return rewritten
}

function shouldRewriteLegacySourceForPrompt(source: SourceFile): boolean {
  return (
    (source.kind === 'home' && source.relativePath === 'home.md') ||
    (source.kind === 'addendum' && source.relativePath === 'addendum.md')
  )
}

function sourceContentForPrompt(source: SourceFile): string {
  if (!shouldRewriteLegacySourceForPrompt(source)) {
    return source.content
  }

  try {
    const parsed = matter(source.content)
    if (!parsed.data || typeof parsed.data !== 'object' || Array.isArray(parsed.data)) {
      return source.content
    }

    const rewrittenData = rewriteLegacyFrontmatterAssetRefs(parsed.data as Record<string, unknown>)
    return matter.stringify(parsed.content, rewrittenData).trim()
  } catch {
    return source.content
  }
}

function parseContentSource(relativePath: string, sourcePath: string): SourceFile | undefined {
  const normalizedPath = relativePath.split(sep).join('/')
  const fileName = basename(normalizedPath)
  const extension = fileName.endsWith('.mdx') ? '.mdx' : '.md'
  const parsed = parseMarkdown(sourcePath)

  if (normalizedPath.match(/^home(?:\/index)?(?:\.([^.]+))?\.(md|mdx)$/)) {
    const match = normalizedPath.match(/^home(?:\/index)?(?:\.([^.]+))?\.(md|mdx)$/)
    const locale = match?.[1]

    if (locale && locale !== 'en') return undefined

    return {
      sourcePath,
      relativePath,
      slug: 'home',
      kind: 'home',
      extension: extension,
      content: parsed.content,
      data: parsed.data,
      frontmatterError: parsed.frontmatterError,
    } satisfies SourceFile
  }

  if (normalizedPath.match(/^addendum(?:\/index)?(?:\.([^.]+))?\.(md|mdx)$/)) {
    const match = normalizedPath.match(/^addendum(?:\/index)?(?:\.([^.]+))?\.(md|mdx)$/)
    const locale = match?.[1]

    if (locale && locale !== 'en') return undefined

    return {
      sourcePath,
      relativePath,
      slug: 'addendum',
      kind: 'addendum',
      extension: extension,
      content: parsed.content,
      data: parsed.data,
      frontmatterError: parsed.frontmatterError,
    } satisfies SourceFile
  }

  const pageMatch = normalizedPath.match(/^pages\/([^/]+)\/index(?:\.([^.]+))?\.(md|mdx)$/)
  if (pageMatch) {
    const [, slug, locale] = pageMatch

    if (locale && locale !== 'en') return undefined

    return {
      sourcePath,
      relativePath,
      slug,
      kind: 'page',
      extension,
      content: parsed.content,
      data: parsed.data,
      frontmatterError: parsed.frontmatterError,
    } satisfies SourceFile
  }

  const postMatch = normalizedPath.match(/^posts\/([^/]+)\/index(?:\.([^.]+))?\.(md|mdx)$/)
  if (postMatch) {
    const [, slug, locale] = postMatch

    if (locale && locale !== 'en') return undefined

    return {
      sourcePath,
      relativePath,
      slug,
      kind: 'post',
      extension: extension,
      content: parsed.content,
      data: parsed.data,
      frontmatterError: parsed.frontmatterError,
    } satisfies SourceFile
  }

  return undefined
}

function parsePageSource(relativePath: string, sourcePath: string): SourceFile | undefined {
  const normalizedPath = relativePath.split(sep).join('/')
  const match = normalizedPath.match(/^([^/]+)\.(md|mdx)$/)

  if (!match) {
    return undefined
  }

  const extension = sourcePath.endsWith('.mdx') ? '.mdx' : '.md'
  const slug = match[1]
  const parsed = parseMarkdown(sourcePath)

  return {
    sourcePath,
    relativePath,
    slug,
    kind: 'page',
    extension,
    content: parsed.content,
    data: parsed.data,
    frontmatterError: parsed.frontmatterError,
  } satisfies SourceFile
}

function discoverFromContent(rootContentDir: string): SourceFile[] {
  return walk(rootContentDir)
    .map((sourcePath) => {
      const filePathRelativeToContent = sourcePath.replace(`${rootContentDir}${sep}`, '')
      const source = parseContentSource(filePathRelativeToContent, sourcePath)

      if (!source) {
        return undefined
      }

      return source
    })
    .filter((source): source is SourceFile => Boolean(source))
}

function discoverFromPages(rootPagesDir: string): SourceFile[] {
  return walk(rootPagesDir)
    .map((sourcePath) => {
      const filePathRelativeToPages = sourcePath.replace(`${rootPagesDir}${sep}`, '')
      return parsePageSource(filePathRelativeToPages, sourcePath)
    })
    .filter((source): source is SourceFile => Boolean(source))
}

export function discoverEnglishSources(rootDir = process.cwd()): SourceFile[] {
  const rootContentDir = join(rootDir, contentDir)
  const rootPagesDir = join(rootDir, pagesDir)

  const allSources = [
    ...discoverFromContent(rootContentDir),
    ...discoverFromPages(rootPagesDir),
  ].sort((a, b) => a.relativePath.localeCompare(b.relativePath))

  return allSources
}

function expectedTranslationPaths(sources: SourceFile[], rootDir: string): Set<string> {
  const paths = new Set<string>()

  for (const source of sources) {
    paths.add(source.sourcePath)
    for (const lang of translatableLangs) {
      paths.add(destinationFor(source, lang, rootDir))
    }
  }

  return paths
}

function destinationDirectoriesForSources(sources: SourceFile[], rootDir: string): Set<string> {
  const paths = new Set<string>()
  for (const source of sources) {
    paths.add(destinationDirectory(source, rootDir))
  }
  return paths
}

function destinationDirectory(source: SourceFile, rootDir: string): string {
  switch (source.kind) {
    case 'home':
      return join(rootDir, contentDir, 'home')
    case 'addendum':
      return join(rootDir, contentDir, 'addendum')
    case 'post':
      return join(rootDir, contentDir, 'posts', source.slug)
    case 'page':
      return join(rootDir, contentDir, 'pages', source.slug)
    default:
      throw new Error(`Unsupported kind: ${source.kind}`)
  }
}

export function destinationFor(source: SourceFile, lang: TranslationLang, rootDir = process.cwd()): string {
  if (!isLang(lang) || lang === defaultLang) {
    throw new Error(`Unsupported translation language: ${lang}`)
  }

  return join(destinationDirectory(source, rootDir), `index.${lang}${source.extension}`)
}

export function promptPathFor(source: SourceFile, lang: TranslationLang, rootDir = process.cwd()): string {
  const folder = source.kind === 'post' ? 'posts' : source.kind === 'page' ? 'pages' : source.kind
  return join(rootDir, 'translation-prompts', lang, folder, `${source.slug}.prompt.md`)
}

export function buildTranslationPrompt(source: SourceFile, lang: TranslationLang, rootDir = process.cwd()): string {
  const meta = languageMeta[lang]
  const relativeDestination = relative(rootDir, destinationFor(source, lang, rootDir))
  const sourceContent = sourceContentForPrompt(source)
  const preservePathInstruction = shouldRewriteLegacySourceForPrompt(source)
    ? '- Preserve image and local file paths as shown in the Source file block.'
    : '- Preserve image paths exactly, including relative paths such as ./cover.jpg.'

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
    preservePathInstruction,
    '- Keep dates, booleans, arrays, and nested frontmatter objects valid.',
    '',
    'Source file:',
    '```markdown',
    sourceContent,
    '```',
    '',
  ].join('\n')
}

function frontmatterKeys(data: Record<string, unknown>): string[] {
  return Object.keys(data).sort()
}

function frontmatterAssetRefs(data: Record<string, unknown>): Array<{ field: string; value: string }> {
  const refFields = ['coverImage', 'avatarImage']

  return refFields.flatMap((field) => {
    const block = data[field]
    if (!block || typeof block !== 'object') return []

    if (Array.isArray(block)) return []

    const src = (block as { src?: unknown }).src

    if (typeof src === 'string' && src.trim().startsWith('./')) {
      return [{ field, value: src }]
    }

    return []
  })
}

function validateFrontmatterAssets(
  translationPath: string,
  translationData: Record<string, unknown>,
  rootDir: string,
  errors: string[],
): void {
  const refs = frontmatterAssetRefs(translationData)

  for (const { field, value } of refs) {
    const translationDir = dirname(translationPath)
    const translationAssetPath = join(translationDir, value)
    if (!existsSync(translationAssetPath)) {
      errors.push(`Missing ${field}.src referenced by ${relative(rootDir, translationPath)}: ${value}`)
    }
  }
}

function validateLocalLinks(content: string, sourcePath: string): string[] {
  return [...content.matchAll(/\]\((\.\/[^)\s]+)(?:\s+['"][^'"]+['"])?\)/g)]
    .map((match) => match[1])
    .map((localRef) => {
      const assetPath = join(dirname(sourcePath), localRef)
      return existsSync(assetPath) ? '' : localRef
    })
    .filter(Boolean)
}

function validateUnsupportedLocaleFiles(source: SourceFile, rootDir: string, errors: string[]): void {
  const destinationDir = destinationDirectory(source, rootDir)

  if (!existsSync(destinationDir)) return

  const translatedFiles = readdirSync(destinationDir, { withFileTypes: true })

  for (const entry of translatedFiles) {
    if (!entry.isFile()) continue

    const match = entry.name.match(/^index\.([^.]+)\.(mdx?)$/)
    if (!match) continue

    const locale = match[1]
    const ext = `.${match[2]}` as '.md' | '.mdx'
    const translatedFile = join(destinationDir, entry.name)
    const translatedRelative = relative(rootDir, translatedFile)

    if (locale === defaultLang) {
      if (ext !== source.extension) {
        errors.push(`Unsupported translation extension in ${translatedRelative}: ${ext} for default language`)
      }

      continue
    }

    if (!isLang(locale)) {
      errors.push(`Unsupported translation language in ${translatedRelative}: ${locale}`)
      continue
    }

    if (ext !== source.extension) {
      errors.push(`Unsupported translation extension in ${translatedRelative}: ${ext}`)
      continue
    }

    const localeExpected = destinationFor(source, locale as TranslationLang, rootDir)
    if (translatedFile !== localeExpected) {
      errors.push(`Route/layout mismatch for translation path: expected ${relative(rootDir, localeExpected)}, found ${translatedRelative}`)
    }
  }
}

function validateRouteLayout(rootDir: string, sources: SourceFile[], errors: string[]): void {
  const rootContent = join(rootDir, contentDir)
  if (!existsSync(rootContent)) return

  const expected = expectedTranslationPaths(sources, rootDir)
  const expectedDestinationDirs = destinationDirectoriesForSources(sources, rootDir)
  const translationCandidates = walk(rootContent).filter((filePath) => translationFilePattern.test(basename(filePath)))

  for (const candidate of translationCandidates) {
    if (expected.has(candidate)) continue

    const translatedRelative = relative(rootDir, candidate)
    const fileName = basename(candidate)
    const match = fileName.match(translationFilePattern)

    if (!match) continue

    const [_, locale] = match
    const directory = dirname(candidate)

    if (!expectedDestinationDirs.has(directory)) {
      errors.push(`Route/layout mismatch for translation path: expected translated files in source-mapped directories, found ${translatedRelative}`)
      continue
    }

    if (locale !== defaultLang && !isLang(locale)) {
      continue
    }
  }
}

export function validateTranslations(rootDir = process.cwd()): string[] {
  const errors: string[] = []
  const sources = discoverEnglishSources(rootDir)

  for (const source of sources) {
    if (source.frontmatterError) {
      errors.push(`Malformed source frontmatter in ${relative(rootDir, source.sourcePath)}: ${source.frontmatterError}`)
    }

    if (source.kind === 'page' && !supportedPages.has(source.slug)) {
      errors.push(`Unsupported page slug at ${relative(rootDir, source.sourcePath)}: ${source.slug}`)
    }

    for (const lang of translatableLangs) {
      const destination = destinationFor(source, lang, rootDir)
      const relativeDestination = relative(rootDir, destination)

      if (!existsSync(destination)) {
        errors.push(`Missing translation: ${relativeDestination}`)
        continue
      }

      const translatedContent = readFileSync(destination, 'utf8')
      const parsed = parseMarkdown(destination)

      if (parsed.frontmatterError) {
        errors.push(`Malformed translated frontmatter in ${relativeDestination}: ${parsed.frontmatterError}`)
        continue
      }

      const sourceKeys = frontmatterKeys(source.data)
      const translatedKeys = frontmatterKeys(parsed.data)

      if (JSON.stringify(sourceKeys) !== JSON.stringify(translatedKeys)) {
        errors.push(
          `Frontmatter keys differ in ${relativeDestination}: expected ${sourceKeys.join(', ')}, received ${translatedKeys.join(', ')}`,
        )
      }

      const localRefs = validateLocalLinks(translatedContent, destination)

      for (const localRef of localRefs) {
        errors.push(`Missing local asset referenced by ${relativeDestination}: ${localRef}`)
      }

      validateFrontmatterAssets(
        destination,
        parsed.data as Record<string, unknown>,
        rootDir,
        errors,
      )
    }

    validateUnsupportedLocaleFiles(source, rootDir, errors)
  }

  validateRouteLayout(rootDir, sources, errors)

  return errors
}
