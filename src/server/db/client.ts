import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import * as schema from './schema';

export const databaseUrl = process.env['DATABASE_URL'] ?? 'data/beercraft.db';

if (databaseUrl !== ':memory:') {
  mkdirSync(dirname(databaseUrl), { recursive: true });
}

const sqlite = new Database(databaseUrl);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle({ client: sqlite, schema });

export type Db = typeof db;
