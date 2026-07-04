import type { APIContext } from 'astro'
import siteConfig from '~/site.config'
import { contentSlug, getSortedPosts } from '~/content-utils'
import { supportedLangs } from '~/i18n'

export async function GET(context: APIContext) {
  // Temporarily return a placeholder response
  return new Response(null, {
    status: 404,
    statusText: 'Social cards temporarily disabled',
  })
}

export async function getStaticPaths() {
  const paths = []
  for (const lang of supportedLangs) {
    const posts = await getSortedPosts(lang)
    paths.push(
      ...posts.map((post) => ({
        params: { lang, slug: contentSlug(post) },
        props: {
          title: post.data.title,
          author: post.data.author || siteConfig.author,
        },
      })),
      {
        params: { lang, slug: '__default' },
        props: { title: siteConfig.title, author: siteConfig.author },
      },
    )
  }
  return paths
}
