import { asc, eq } from 'drizzle-orm';
import { Hono } from 'hono';

import { db } from '../db/client';
import { categories } from '../db/schema';

const app = new Hono()
  .get('/', async (c) => {
    const rows = await db.query.categories.findMany({ orderBy: asc(categories.name) });
    return c.json(rows);
  })
  .get('/:slug', async (c) => {
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, c.req.param('slug')),
      with: { products: true },
    });
    if (!category) {
      return c.json({ error: 'Category not found' }, 404);
    }
    return c.json(category);
  });

export default app;
