import { and, asc, eq, like, type SQL } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '../db/client';
import { categories, products } from '../db/schema';
import { idParam, validate } from './validation';

const listQuery = z.object({
  category: z.string().min(1).optional(),
  q: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const app = new Hono()
  .get('/', validate('query', listQuery), async (c) => {
    const { category, q, limit, offset } = c.req.valid('query');

    const filters: SQL[] = [];
    if (category) {
      const found = await db.query.categories.findFirst({
        where: eq(categories.slug, category),
        columns: { id: true },
      });
      if (!found) {
        return c.json([]);
      }
      filters.push(eq(products.categoryId, found.id));
    }
    if (q) {
      filters.push(like(products.name, `%${q}%`));
    }

    const rows = await db.query.products.findMany({
      where: and(...filters),
      with: { category: true },
      orderBy: asc(products.name),
      limit,
      offset,
    });
    return c.json(rows);
  })
  .get('/:id', validate('param', idParam), async (c) => {
    const { id } = c.req.valid('param');
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: { category: true },
    });
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    return c.json(product);
  });

export default app;
