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

    const req = { url: '/user1' } as any
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

    const req = { url: '/user?filter=1&status=2' } as any
    const res = await router.route(req)
    if (res !== null) {
      expect((await res.json()).filter).toEqual('1')
    }
  })
})
