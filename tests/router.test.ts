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

  it('request error', async () => {
    const func = jest.fn(() => {})

    router.get('/user', func)

    try {
      const res = await router.route(null as any)
    } catch (e) {
      expect(e.message).toEqual('Cannot read property \'url\' of null')
    }
  })

  it('request error', async () => {
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
})
