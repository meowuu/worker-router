# worker-router

worker-router is a light router util, recommend use in [Cloudflare Worker](https://workers.cloudflare.com/)

# Install

``` bash
npm install worker-router
# or use yarn
yarn add worker-router
```

# Usage

``` javascript
import Router from 'worker-router'

const router = new Router()

router.get('/home', () => {

})

const resp = await router.route(request)
```

# Todos
- [ ] middleware
- [ ] redirect