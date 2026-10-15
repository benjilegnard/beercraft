import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { isMainModule } from '@angular/ssr/node';

import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { existsSync } from 'node:fs';

import { join } from 'node:path';

import { api } from './server/index';

/**
 * Initialize Hono and export the app instance
 */
export const app = new Hono({ strict: false }).use(requestId()).use(secureHeaders());

const engine = new AngularAppEngine({
  allowedHosts: ['localhost'],
});

const browserDistFolder = join(import.meta.dirname, '../browser');

/**
 * Endpoints can be defined here
 */
app.get('/api/health', async (c) => {
  return c.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.route('/api', api);

if (existsSync(browserDistFolder)) {
  /**
   * Serve static files
   */
  app.use(
    '*',
    serveStatic({
      root: join(import.meta.dirname, '../browser'),
      onNotFound: () => {
        // Optionally log or handle the case where a static file is not found
      },
    }),
  );
}
/**
 * Handle SSR for rest of the routes using Angular App Engine
 */
app.use('*', async (c, next) => {
  const response = await engine.handle(c.req.raw);
  if (response) {
    return response;
  }

  return next();
});

/**
 * Not found
 */
app.notFound((c) => {
  return c.text('404 - Not found', 404);
});

/**
 * Error handling
 */
app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return error.getResponse();
  }
  console.error(`${error}`);
  return c.text('Internal Server Error', 500);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = Number(process.env['PORT'] || 4000);
  serve({ fetch: app.fetch, port: port }, (info) => {
    console.log(`Hono server listening on http://localhost:${info.port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createRequestHandler(app.fetch);
