import { Hono } from 'hono'
import { prisma } from '../db/index.js'

const collect = new Hono()

collect.post('/coverage/client', async (c) => {
  const body = await c.req.json()
  await prisma.coverageHit.create({
    data: {
      id: body.id,
      buildHash: body.buildHash,
      sceneKey: body.sceneKey,
      rawFilePath: body.rawFilePath,
      s: body.s,
      f: body.f,
      b: body.b,
      createdAt: new Date(),
    },
  })
  return c.json({ ok: true, received: body }, 200)
})

export default collect
