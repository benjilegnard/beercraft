import { defineConfig } from 'drizzle-kit';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const url = process.env['DATABASE_URL'] ?? 'data/beercraft.db';

// drizzle-kit does not create the parent folder of the SQLite file
mkdirSync(dirname(url), { recursive: true });

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url },
});
