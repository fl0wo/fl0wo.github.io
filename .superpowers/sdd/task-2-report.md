# Task 2 Report — Prompt Generation And Validation Script Core

## Implementation Summary
- Added `scripts/i18n/shared.ts` with:
  - `SourceFile` type and filesystem helpers:
    - `discoverEnglishSources(rootDir)`
    - `destinationFor(source, lang)`
    - `promptPathFor(source, lang, rootDir)`
    - `buildTranslationPrompt(source, lang)`
    - `validateTranslations(rootDir)`
- Added CLI scripts:
  - `scripts/i18n/prompts.ts` to generate translation prompts for all non-default languages.
  - `scripts/i18n/validate.ts` to validate translated content and fail with exit code 1 on errors.
- Added `test/i18n/scripts.test.ts` covering source discovery, prompt generation, and translation validation.
- Updated `package.json` scripts:
  - `i18n:prompts: "tsx scripts/i18n/prompts.ts"`
  - `i18n:validate: "tsx scripts/i18n/validate.ts"`
  - `build: "pnpm run i18n:validate && astro build"`

## TDD RED/GREEN Evidence
### RED (before implementation)
- Added `test/i18n/scripts.test.ts`.
- `pnpm run i18n:test` failed with import resolution:
  - `Cannot find module '../../scripts/i18n/shared'`.

### GREEN (after implementation)
- Implemented `scripts/i18n/shared.ts` and related scripts.
- `pnpm run i18n:test` PASS:
  - `Test Files  2 passed (2)`
  - `Tests  8 passed (8)`
- Build check PASS (after running in escalated mode for sandbox IPC constraints):
  - `i18n validation passed.`
  - `astro build` completed successfully and generated `dist/`.

## Files Changed
- `package.json`
- `scripts/i18n/shared.ts` (new)
- `scripts/i18n/prompts.ts` (new)
- `scripts/i18n/validate.ts` (new)
- `test/i18n/scripts.test.ts` (new)

## Self-review
- Implementation aligns with the task brief’s step-by-step interfaces and logic.
- Validation now runs before build and catches:
  - missing translated files for non-default languages,
  - frontmatter key mismatches,
  - missing local asset references in translations.
- Prompt generation uses source-frontmatter-safe content extraction and metadata-aware destination targeting.

## Concerns
- `pnpm run build` in this environment initially failed under non-escalated sandbox with:
  - `listen EPERM` from `tsx` pipe creation in `/var/.../tsx-...pipe`.
  - Re-run with escalation succeeded.
- No functional issues remain; no additional follow-up required.
