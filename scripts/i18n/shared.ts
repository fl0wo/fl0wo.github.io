import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import matter from 'gray-matter'
import { defaultLang, isLang, languageMeta, type Lang, supportedLangs } from '../../src/i18n'

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

export function promptPathFor(
  source: SourceFile,
  lang: TranslationLang,
  rootDir = process.cwd(),
): string {
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

      const localRefs = [...translatedContent.matchAll(/\]\((\.\/[^)\s]+)(?:\s+['"][^'"]+['"])?\)/g)].map((match) => match[1])

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
