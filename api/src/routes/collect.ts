import { Hono } from 'hono'
import { prisma } from '../db/index.js'

const collect = new Hono()

collect.post('/coverage/client', async (c) => {
  const body = await c.req.json()

  const data = Object.entries(body).map(([key, value]:any) => {
    return {
      id: Math.random().toString(36).substring(2, 15),
      buildHash: value.buildHash,
      sceneKey: value.sceneKey||'',
      rawFilePath: value.rawFilePath||'',
      s: value.s,
      f: value.f,
      b: value.b,
      createdAt: new Date(),
    }
  })

  await prisma.coverageHit.createMany({
    data,
  })
  return c.json({ ok: true, received: body }, 200)
})

export default collect
