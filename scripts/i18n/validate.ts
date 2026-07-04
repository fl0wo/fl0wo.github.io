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
