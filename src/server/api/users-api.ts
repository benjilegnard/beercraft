import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { hashPassword } from '../auth/password';
import { db } from '../db/client';
import { users } from '../db/schema';
import { idParam, validate } from './validation';

const publicColumns = {
  id: users.id,
  email: users.email,
  name: users.name,
  createdAt: users.createdAt,
};

const registerBody = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(100),
});

const app = new Hono()
  .post('/', validate('json', registerBody), async (c) => {
    const { email, password, name } = c.req.valid('json');

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true },
    });
    if (existing) {
      return c.json({ error: 'Email already registered' }, 409);
    }

    const [user] = await db
      .insert(users)
      .values({ email, name, passwordHash: await hashPassword(password) })
      .returning(publicColumns);
    return c.json(user, 201);
  })
  .get('/:id', validate('param', idParam), async (c) => {
    const { id } = c.req.valid('param');
    const [user] = await db.select(publicColumns).from(users).where(eq(users.id, id));
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    return c.json(user);
  });

export default app;
