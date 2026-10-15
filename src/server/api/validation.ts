import { zValidator } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import { z } from 'zod';

/**
 * zValidator wrapper returning a JSON `{ error, issues }` body with status 400.
 */
export const validate = <T extends z.ZodType, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T,
) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid request', issues: z.treeifyError(result.error) }, 400);
    }
    return undefined;
  });

export const idParam = z.object({ id: z.coerce.number().int().positive() });
