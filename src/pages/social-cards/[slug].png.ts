import type { APIContext } from 'astro'
import siteConfig from '~/site.config'
import { getSortedPosts } from '~/utils'

type Props = {
  title: string
  pubDate?: string
  author: string
}

export async function GET(context: APIContext) {
  // Temporarily return a placeholder response
  return new Response(null, {
    status: 404,
    statusText: 'Social cards temporarily disabled'
  })
}

export async function getStaticPaths() {
  const posts = await getSortedPosts()
  return posts
    .map((post) => ({
      params: { slug: post.id },
      props: {
        title: post.data.title,
        author: post.data.author || siteConfig.author,
      },
    }))
    .concat([
      {
        params: { slug: '__default' },
        props: { title: siteConfig.title, author: siteConfig.author },
      },
    ])
}