import { desc, eq, inArray, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '../db/client';
import { orderItems, orders, orderStatuses, products, users } from '../db/schema';
import { idParam, validate } from './validation';

/**
 * Business rule violation, thrown inside a transaction to roll it back.
 */
class OrderError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 404,
  ) {
    super(message);
  }
}

const createBody = z.object({
  userId: z.number().int().positive(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .refine((items) => new Set(items.map((i) => i.productId)).size === items.length, {
      message: 'Duplicate productId in items',
    }),
});

const listQuery = z.object({ userId: z.coerce.number().int().positive() });

const statusBody = z.object({ status: z.enum(orderStatuses) });

const findOrder = (id: number) =>
  db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: { with: { product: true } } },
  });

const app = new Hono()
  .post('/', validate('json', createBody), async (c) => {
    const { userId, items } = c.req.valid('json');

    let orderId: number;
    try {
      // better-sqlite3 transactions must be synchronous
      orderId = db.transaction((tx) => {
        const user = tx.select({ id: users.id }).from(users).where(eq(users.id, userId)).get();
        if (!user) {
          throw new OrderError('User not found', 404);
        }

        const ids = items.map((i) => i.productId);
        const rows = tx.select().from(products).where(inArray(products.id, ids)).all();
        const byId = new Map(rows.map((p) => [p.id, p]));

        let totalCents = 0;
        for (const item of items) {
          const product = byId.get(item.productId);
          if (!product) {
            throw new OrderError(`Product ${item.productId} not found`, 400);
          }
          if (product.stock < item.quantity) {
            throw new OrderError(`Not enough stock for ${product.name}`, 400);
          }
          totalCents += product.priceCents * item.quantity;
        }

        const order = tx
          .insert(orders)
          .values({ userId, totalCents })
          .returning({ id: orders.id })
          .get();

        tx.insert(orderItems)
          .values(
            items.map((item) => ({
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPriceCents: byId.get(item.productId)!.priceCents,
            })),
          )
          .run();

        for (const item of items) {
          tx.update(products)
            .set({ stock: sql`${products.stock} - ${item.quantity}` })
            .where(eq(products.id, item.productId))
            .run();
        }

        return order.id;
      });
    } catch (error) {
      if (error instanceof OrderError) {
        return c.json({ error: error.message }, error.status);
      }
      throw error;
    }

    return c.json(await findOrder(orderId), 201);
  })
  .get('/', validate('query', listQuery), async (c) => {
    const { userId } = c.req.valid('query');
    const rows = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      with: { items: true },
      orderBy: desc(orders.createdAt),
    });
    return c.json(rows);
  })
  .get('/:id', validate('param', idParam), async (c) => {
    const { id } = c.req.valid('param');
    const order = await findOrder(id);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    return c.json(order);
  })
  .patch('/:id/status', validate('param', idParam), validate('json', statusBody), async (c) => {
    const { id } = c.req.valid('param');
    const { status } = c.req.valid('json');

    try {
      db.transaction((tx) => {
        const order = tx.select().from(orders).where(eq(orders.id, id)).get();
        if (!order) {
          throw new OrderError('Order not found', 404);
        }
        if (order.status === 'cancelled' && status !== 'cancelled') {
          throw new OrderError('Cancelled orders cannot be reopened', 400);
        }

        if (status === 'cancelled' && order.status !== 'cancelled') {
          const lines = tx.select().from(orderItems).where(eq(orderItems.orderId, id)).all();
          for (const line of lines) {
            tx.update(products)
              .set({ stock: sql`${products.stock} + ${line.quantity}` })
              .where(eq(products.id, line.productId))
              .run();
          }
        }

        tx.update(orders).set({ status }).where(eq(orders.id, id)).run();
      });
    } catch (error) {
      if (error instanceof OrderError) {
        return c.json({ error: error.message }, error.status);
      }
      throw error;
    }

    return c.json(await findOrder(id));
  });

export default app;
