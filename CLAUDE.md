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