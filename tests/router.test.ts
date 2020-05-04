import Router from '../src'

describe('test router', () => {
  let router: Router

  beforeEach(() => {
    router = new Router()
  })

  it('get route', async () => {
    const func = jest.fn(() => {
    })

    router.get('/:name', func)

    const req = new Request('/user1')
    await router.route(req)
    expect(func).toHaveBeenCalled()
  })
  
  it('post route', async () => {
    const func = jest.fn(() => {
    })

    router.post('/post', func)

    const req = new Request('/post', {
      method: 'POST'
    })
    await router.route(req)
    expect(func).toHaveBeenCalled()
  })

  it('route result', async () => {
    const func = jest.fn((req) => {
      return {
        name: req.params.name
      }
    })

    router.get('/:name', func)

    const req = new Request('/user1')
    const res = await router.route(req)
    if (res !== null) {
      expect((await res.json()).name).toEqual('user1')
    }
  })

  it('querys', async () => {
    const func = jest.fn((req) => {
      return {
        filter: req.querys.filter
      }
    })

    router.get('/user', func)

    const req = new Request('/user?filter=1&status=2')
    const res = await router.route(req)
    if (res !== null) {
      expect((await res.json()).filter).toEqual('1')
    }
  })

  it('request error whit null', async () => {
    const func = jest.fn(() => {})

    router.get('/user', func)

    try {
      const res = await router.route(null as any)
    } catch (e) {
      expect(e.message).toEqual('Cannot read property \'url\' of null')
    }
  })

  it('request error with empty request', async () => {
    const func = jest.fn(() => {})

    router.get('/user', func)

    try {
      await router.route({} as any)
    } catch (e) {
      expect(e.message).toEqual('can\'t pase this request path.')
    }
  })

  it('route order', async () => {
    const func = jest.fn(() => {})
    const defaultRoute = jest.fn(() => {})

    router.get('/user', func)
    router.default(defaultRoute)

    await router.route(new Request('/post'))
    expect(defaultRoute).toBeCalled()
    expect(func).not.toBeCalled()
  })

  it('url is empty', async () => {
    const func = jest.fn(() => {})

    router.get('/user', func)

    try {
      await router.route({ url: '' } as any)
    } catch ({ message }) {
      expect(message).toEqual('can\'t find this request url.')
    }
  })

  it('empty response', async () => {
    const response = await router.route(new Request('/user'))
    const text = await response.text()
    expect(text).toEqual('')
  })

  it('test all handle', async () => {
    const func = jest.fn(() => {})
    router.all('/user', func)
    await router.route(new Request('/user', { method: 'GET' }))
    await router.route(new Request('/user', { method: 'POST' }))
    expect(func).toBeCalledTimes(2)
  })

  it('middleware intercept', async () => {
    const auth = jest.fn(async () => {
      return new Response("Intercept")
    })
    const handle = jest.fn(() => {})

    router.use(auth)
    router.all('/', () => {})
    await router.route(new Request('/'))
    expect(auth).toBeCalledTimes(1)
    expect(handle).toBeCalledTimes(0)
  })

  it('middleware context', async () => {
    const middleware1 = jest.fn(async (req, context) => {
      context.name = '1'
    })
    const middleware2 = jest.fn(async (req, context) => {
      expect(context.name).toEqual('1')
    })
    const handle = jest.fn(() => {})

    router.use(middleware1)
    router.use(middleware2)
    router.all('/', () => {})
    await router.route(new Request('/'))
  })
})
