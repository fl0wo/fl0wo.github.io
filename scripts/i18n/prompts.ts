import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, relative } from 'node:path'
import { defaultLang, supportedLangs, type Lang } from '../../src/i18n'
import { buildTranslationPrompt, discoverEnglishSources, promptPathFor, type TranslationLang } from './shared'

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
