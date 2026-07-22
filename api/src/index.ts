import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import logger from './logger/index.js'

const app = new Hono()

app.get('/', (c) => {
  logger('Hello Hono!')
  return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
