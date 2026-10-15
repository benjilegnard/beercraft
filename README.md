# Beercraft

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.6.

Angular SSR app with a [Hono](https://hono.dev/) server and a REST API backed by SQLite through [Drizzle ORM](https://orm.drizzle.team/). See the [API reference](docs/reference/api.md).

## Installation

Requirements: Node.js 22+ and [pnpm](https://pnpm.io/).

```bash
pnpm install       # also builds the better-sqlite3 native module
pnpm db:migrate    # create the SQLite database and apply migrations
pnpm db:seed       # insert sample data
pnpm start         # start the dev server on http://localhost:4200
```

The seed creates a demo user: `demo@beercraft.dev` / `beercraft123`.

### Database

The database is a SQLite file, `data/beercraft.db` by default. Set `DATABASE_URL` to use another path:

```bash
DATABASE_URL=data/test.db pnpm db:migrate
```

| Command            | Description                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| `pnpm db:migrate`  | Apply pending migrations from `drizzle/`                                    |
| `pnpm db:generate` | Generate a new migration after changing `src/server/db/schema.ts`           |
| `pnpm db:seed`     | Delete all data and insert sample categories, products, a user and an order |
| `pnpm db:studio`   | Open Drizzle Studio to browse the database                                  |

To reset the database from scratch:

```bash
rm -rf data && pnpm db:migrate && pnpm db:seed
```

If `better-sqlite3` fails to load (for example after a Node.js upgrade), rebuild it with `pnpm rebuild better-sqlite3`.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
