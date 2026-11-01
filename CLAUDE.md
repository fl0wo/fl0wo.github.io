# CLAUDE.md: Personal Website Guidelines

## Development Commands
- Run local preview: `npx serve` or `python -m http.server`
- Deploy to AWS: `npx sst deploy` or `npx sst deploy --stage production`
- Update DNS: Check Route 53 settings in AWS console

## Code Style
- HTML: Semantic tags, proper indentation (4 spaces)
- CSS: Mobile-first approach, media queries for responsiveness
- TypeScript: Use explicit types, follow ES6+ conventions
- File structure: Keep assets in /files directory
- Naming: Kebab-case for filenames, camelCase for variables

## Project Structure
- index.html: Main page content
- style.css: All styling (no separate SCSS files)
- consts.ts: Configuration constants
- sst.config.ts: AWS SST deployment configuration
- /files: All media assets and documents

## Notes
- Site uses SST for AWS deployment/hosting
- Domain: floriansabani.com (and www redirect)
- Project name in AWS: fl0wosite

## 3lm (unlisted study notes)
- Reachable only by URL: `/{lang}/3lm` (and `/3lm` → `/en/3lm`). Never link it from public pages.
- Archive: `src/content/3lm/<archive>/index.<lang>.md` (title, description, order, draft).
- Lesson: `src/content/3lm/<archive>/<lesson>/index.<lang>.md` (article fields + unique `lesson` number).
- Every file needs en/it/ar/zh versions (`pnpm i18n:prompts` writes translation prompts; the build validates).
- "Unlisted" is enforced centrally: `isUnlistedRoute`/`isUnlistedPath` in `src/i18n.ts` drive noindex meta, sitemap exclusion; lesson pages omit `data-pagefind-body`.
- Link hadith citations to sunnah.com: `[Muslim 408](https://sunnah.com/muslim:408)` (slugs: bukhari, muslim, abudawud, tirmidhi, nasai, ibnmajah). Open each link in a browser before publishing: sunnah.com numbering can differ from other editions, some entries need a letter suffix (e.g. `2354a`), and it blocks curl.
- At the edge, `worker/index.ts` runs only for /3lm paths (`run_worker_first` in wrangler.jsonc): bots get 403, browsers get `X-Robots-Tag: noindex`. The main module may export only handlers; helpers live in `worker/guard.ts`.
- The GitHub repo is public: anything committed under `src/content/3lm` is readable there.
