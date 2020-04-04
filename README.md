# worker-router
![Node.js CI](https://github.com/meowuu/worker-router/workflows/Node.js%20CI/badge.svg?branch=master)
[![codecov](https://codecov.io/gh/meowuu/worker-router/branch/master/graph/badge.svg)](https://codecov.io/gh/meowuu/worker-router)

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