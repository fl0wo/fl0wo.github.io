npx sst deploy --stage production

## Multilingual content workflow

The English files are the source of truth. Edit only the `index.en.md` files under:

- `src/content/home`
- `src/content/addendum`
- `src/content/pages/*`
- `src/content/posts/*`

After changing English content, run:

```bash
pnpm run i18n:prompts
```

This writes paste-ready prompts into `translation-prompts/{it,ar,zh}/...`. Paste each prompt into your translation tool and save the returned Markdown to the destination path shown inside the prompt.

Then run:

```bash
pnpm run i18n:validate
pnpm build
```

The validator checks for missing translations, unsupported language files, malformed frontmatter, mismatched frontmatter keys, route/layout mismatches, and missing local assets. Published pages use language-prefixed URLs such as `/en/`, `/it/about`, `/ar/projects`, and `/zh/posts`.

## TODO:

# Articles I want to write:
1. how i build multi-tenant applications (D1 + better-auth + drizzle ORM + DO)
2. e2e testing locally with cloudflare
3. auto-generated openapi spec with zod + honojs
