import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import logger from './logger/index.js'
import books from './routes/books.js'
import collect from './routes/collect.js'
import coverage from './routes/coverage.js'
import health from './routes/health.js'

const app = new Hono()

app.get('/', (c) => {
  logger('Hello Hono!')
  return c.text('Hello Hono!')
})

app.route('/vi/health', health)
app.route('/books', books)
app.route('/api', collect)
app.route('/api', coverage)

// 快照 HTML 报告：api/public/snapshots/{id}/index.html → /snapshots/{id}/index.html
app.use('/snapshots/*', serveStatic({ root: './public' }))

serve({
  fetch: app.fetch,
  port: 8080
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
