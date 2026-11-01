import { createMarkdownProcessor } from '@astrojs/markdown-remark'
import remarkDirective from 'remark-directive'
import { describe, expect, test } from 'vitest'
import remarkUnknownDirectives from '../../src/plugins/remark-unknown-directives'

async function render(markdown: string): Promise<string> {
  const processor = await createMarkdownProcessor({
    remarkPlugins: [remarkDirective, remarkUnknownDirectives],
    syntaxHighlight: false,
  })
  return (await processor.render(markdown)).code
}

describe('remark-unknown-directives', () => {
  test('restores verse references parsed as text directives without adding whitespace', async () => {
    expect(await render("(Qur'an 105:1)")).toBe("<p>(Qur’an 105:1)</p>")
    expect(await render('See 2:255 and 3:190.')).toBe('<p>See 2:255 and 3:190.</p>')
  })

  test('restores unknown leaf directives as plain text', async () => {
    expect(await render('::unknown')).toBe('<p>::unknown</p>')
  })
})
