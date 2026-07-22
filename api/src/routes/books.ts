import { Prisma } from '@prisma/client'
import { Hono } from 'hono'
import { prisma } from '../db/index.js'

const books = new Hono()

books.get('/', async (c) => {
  const list = await prisma.book.findMany({
    orderBy: { title: 'asc' },
  })
  return c.json(list)
})

books.get('/:id', async (c) => {
  const id = c.req.param('id')
  const book = await prisma.book.findUnique({ where: { id } })
  if (!book) {
    return c.json({ error: 'Book not found' }, 404)
  }
  return c.json(book)
})

books.post('/', async (c) => {
  const body = await c.req.json<{ title?: string; author?: string }>()
  if (!body.title?.trim() || !body.author?.trim()) {
    return c.json({ error: 'title and author are required' }, 400)
  }

  const book = await prisma.book.create({
    data: {
      title: body.title.trim(),
      author: body.author.trim(),
    },
  })
  return c.json(book, 201)
})

books.put('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ title?: string; author?: string }>()
  if (!body.title?.trim() || !body.author?.trim()) {
    return c.json({ error: 'title and author are required' }, 400)
  }

  try {
    const book = await prisma.book.update({
      where: { id },
      data: {
        title: body.title.trim(),
        author: body.author.trim(),
      },
    })
    return c.json(book)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return c.json({ error: 'Book not found' }, 404)
    }
    throw error
  }
})

books.delete('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    await prisma.book.delete({ where: { id } })
    return c.body(null, 204)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return c.json({ error: 'Book not found' }, 404)
    }
    throw error
  }
})

export default books
