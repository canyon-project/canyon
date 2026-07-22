import { Hono } from 'hono'

const collect = new Hono()

collect.post('/coverage/client', async (c) => {
  const body = await c.req.json()
  return c.json({ ok: true, received: body }, 200)
})

export default collect
