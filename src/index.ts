import parseUrl from 'parseurl'
import { match } from 'path-to-regexp'

type handleResult = any | Response

type handleFunction = (request: RouterRequest, context?: any) => (handleResult | Promise<handleResult>)

type RouterRequest = Request & {
  params?: any
  querys?: any
}

type Method = 'GET' | 'POST' | 'PUT' | 'HEAD' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH'

type middlewareFunction = (req: Request, context: any) => Promise<void | Response>

export default class Router {
  routes = new Map<{ path: string, type: Method | 'ALL'}, handleFunction>()
  defaultRoutes: handleFunction[] = []
  middlewares: middlewareFunction[] = []

  use(auth: middlewareFunction) {
    this.middlewares = this.middlewares.concat(auth)
  }

  get (path: string, handle: handleFunction) {
    this.routes.set({ path, type: 'GET' }, handle)
  }

  post (path: string, handle: handleFunction) {
    this.routes.set({ path, type: 'POST' }, handle)
  }

  all (path: string, handle: handleFunction) {
    this.routes.set({ path, type: 'ALL' }, handle)
  }

  default (handle: handleFunction) {
    this.defaultRoutes.push(handle)
  }

  responseInit: ResponseInit

  constructor (headers: ResponseInit = {
    headers: { 'content-type': 'application/json' }
  }) {
    this.responseInit = headers
  }

  async callHandle (handle: any) {
    return await Promise.resolve(handle)
      .then(result => {
        if (result instanceof Response) return result
        else {
          return new Response(JSON.stringify(result), this.responseInit)
        }
      })
  }

  async invokeMiddleware (middlewares: middlewareFunction[], req: Request, context: any) {
    for (const middle of middlewares) {
      const result = await middle(req, context)
      if (result instanceof Response) {
        return result
      }
    }
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
    const _response = new Response()
    const context = {}
    const result = await this.invokeMiddleware(this.middlewares, _request, context)
    if (result instanceof Response) return result

    for (const [{ path, type }, handle] of this.routes) {
      const matchFunction = match(path, { decode: decodeURIComponent })
      const result = matchFunction(url.pathname)
      if (
        result !== false &&
        (
          _request.method === type ||
          type === 'ALL'
        )
      ) {
        _request.params = result.params

        let querys: { [x: string]: string | string[] | undefined } = {}

        if (typeof url.query === 'string') {
          querys = {}
          url.query.split('&').forEach((item) => {
            const [key, value] = item.split('=')
            querys && (querys[key] = value)
          })
        } else {
          querys = url.query || {}
        }

        _request.querys = querys
        if (handle !== undefined) {
          return await this.callHandle(handle(_request, context))
        }
      }
    }

    if (this.defaultRoutes.length === 0) {
      return _response
    } else {
      let response = _response
      for (const handle of this.defaultRoutes) {
        response = await this.callHandle(handle(_request, context))
      }

      return response
    }
  }
}
