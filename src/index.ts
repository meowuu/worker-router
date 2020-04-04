import parseUrl from 'parseurl'
import { match } from 'path-to-regexp'

type handleResult = any | Response

type handleFunction = (request: RouterRequest) => (handleResult | Promise<handleResult>)

type RouterRequest = Request & {
  params?: any
  querys?: any
}

type Method = 'GET' | 'POST' | 'PUT' | 'HEAD' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH'

export default class Router {
  routes = new Map<{ path: string, type: Method}, handleFunction>()

  get (path: string, handle: handleFunction) {
    this.routes.set({ path, type: 'GET' }, handle)
  }

  post (path: string, handle: handleFunction) {
    this.routes.set({ path, type: 'POST' }, handle)
  }

  responseInit: ResponseInit

  constructor (headers: ResponseInit = {
    headers: { 'content-type': 'application/json' }
  }) {
    this.responseInit = headers
  }

  async route (request: Request) {
    const url = parseUrl(request as any)
    if (url === undefined) {
      throw new Error('can\'t pase this request path.')
    }
    if (url.pathname === null) {
      throw new Error('can\'t find this request url.')
    }

    const _request: RouterRequest = request

    for (const [{ path, type }, handle] of this.routes) {
      const matchFunction = match(path)
      const result = matchFunction(url.pathname)
      if (result !== false && _request.method === type) {
        _request.params = result.params

        let querys: { [x: string]: string | string[] } | null = null

        if (typeof url.query === 'string') {
          querys = {}
          url.query.split('&').forEach((item) => {
            const [key, value] = item.split('=')
            querys && (querys[key] = value)
          })
        } else {
          querys = url.query
        }

        _request.querys = querys
        if (handle !== undefined) {
          return await Promise.resolve(handle(_request))
            .then(result => {
              if (result instanceof Response) return result
              else {
                return new Response(JSON.stringify(result), this.responseInit)
              }
            })
        }
      }
    }

    return new Response()
  }
}
