import rss from '@astrojs/rss'
import siteConfig from '~/site.config'
import type { APIContext, GetStaticPaths } from 'astro'
import { contentSlug, getSortedPosts } from '~/content-utils'
import { assertLang, routePath, supportedLangs } from '~/i18n'
import sanitizeHtml from 'sanitize-html'
import MarkdownIt from 'markdown-it'
const parser = new MarkdownIt()

export const getStaticPaths = (() => {
  return supportedLangs.map((lang) => ({ params: { lang } }))
}) satisfies GetStaticPaths

// https://docs.astro.build/en/recipes/rss/
export async function GET(context: APIContext) {
  if (!siteConfig.site) {
    console.warn(
      'Site URL is required for RSS feed generation. Skipping RSS feed generation.',
    )
    return
  }
  const lang = assertLang(context.params.lang!)
  const posts = await getSortedPosts(lang)
  return rss({
    stylesheet: '/rss.xsl',
    title: siteConfig.title,
    description: siteConfig.description,
    site: siteConfig.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.published,
      description: post.data.description,
      author: post.data.author || siteConfig.author,
      link: routePath(lang, { type: 'post', slug: contentSlug(post) }),
      content: sanitizeHtml(parser.render(post.body || ''), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      }),
    })),
    trailingSlash: false,
  })
}
