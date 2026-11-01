/**
 * Edge guard for the unlisted /3lm section. wrangler.jsonc routes only /3lm paths
 * here (assets.run_worker_first); every other page is served as a static asset.
 */
import { isUnlistedPath } from '../src/i18n'
import { isBot, ROBOTS_HEADER } from './guard'

type Env = { ASSETS: { fetch: (request: Request) => Promise<Response> } }

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url)
    if (!isUnlistedPath(pathname)) return env.ASSETS.fetch(request)

    if (isBot(request.headers.get('user-agent'))) {
      return new Response('Forbidden', {
        status: 403,
        headers: { 'X-Robots-Tag': ROBOTS_HEADER, 'Cache-Control': 'no-store' },
      })
    }

    const asset = await env.ASSETS.fetch(request)
    const response = new Response(asset.body, asset)
    response.headers.set('X-Robots-Tag', ROBOTS_HEADER)
    response.headers.set('Referrer-Policy', 'no-referrer')
    return response
  },
}
