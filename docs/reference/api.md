# API reference

REST API served by the Hono server (`src/server.ts`), all routes under `/api`.

- Dev server: `http://localhost:4200/api`
- Production build: `http://localhost:4000/api` (port set by `PORT`)

Source: `src/server/index.ts` (router) and `src/server/api/*-api.ts` (one file per resource).

## Conventions

- Request and response bodies are JSON (`content-type: application/json`).
- Ids are positive integers.
- Prices are integer **cents** (`priceCents: 450` means 4.50).
- Dates are ISO 8601 strings (`"2026-10-15T15:49:12.000Z"`).
- No authentication yet: orders take a `userId` in the body.

### Errors

| Status | Body                                                | When                                                                      |
| ------ | --------------------------------------------------- | ------------------------------------------------------------------------- |
| 400    | `{ "error": "Invalid request", "issues": { ... } }` | Body, query or path params fail validation (`issues` is a zod error tree) |
| 400    | `Malformed JSON in request body` (text)             | Body is not valid JSON                                                    |
| 400    | `{ "error": "..." }`                                | Business rule violated (stock, unknown product, ...)                      |
| 404    | `{ "error": "... not found" }`                      | Resource does not exist                                                   |
| 409    | `{ "error": "Email already registered" }`           | Duplicate user email                                                      |
| 500    | `Internal Server Error` (text)                      | Unexpected error                                                          |

## Data models

### Category

```json
{ "id": 1, "name": "IPA", "slug": "ipa", "description": "Hoppy, bitter and aromatic pale ales." }
```

### Product

```json
{
  "id": 1,
  "categoryId": 1,
  "name": "Hop Storm",
  "slug": "hop-storm",
  "description": "West Coast IPA, pine and grapefruit.",
  "priceCents": 450,
  "stock": 120,
  "abv": 6.5,
  "imageUrl": null,
  "createdAt": "2026-10-15T15:49:12.000Z"
}
```

`description`, `abv` and `imageUrl` can be `null`.

### User

The password hash is never returned.

```json
{
  "id": 1,
  "email": "demo@beercraft.dev",
  "name": "Demo User",
  "createdAt": "2026-10-15T15:49:12.000Z"
}
```

### Order

```json
{
  "id": 1,
  "userId": 1,
  "status": "pending",
  "totalCents": 3000,
  "createdAt": "2026-10-15T15:50:27.000Z",
  "items": [
    {
      "id": 1,
      "orderId": 1,
      "productId": 4,
      "quantity": 3,
      "unitPriceCents": 700,
      "product": { "...": "Product" }
    }
  ]
}
```

- `status`: `pending` | `paid` | `shipped` | `cancelled`
- `unitPriceCents`: product price at order time (later price changes do not affect it)
- `totalCents`: sum of `unitPriceCents * quantity`

---

## Health

### `GET /api/health`

```json
{ "status": "ok", "message": "Server is running", "timestamp": "2026-10-15T15:49:12.000Z" }
```

## Categories

### `GET /api/categories`

List all categories, sorted by name. Returns `Category[]`.

### `GET /api/categories/:slug`

One category with its products. Returns `Category & { products: Product[] }`.

- 404 if the slug does not exist

```bash
curl localhost:4200/api/categories/ipa
```

## Products

### `GET /api/products`

List products sorted by name, each with its `category`. Returns `(Product & { category: Category })[]`.

| Query param | Type      | Default | Description                              |
| ----------- | --------- | ------- | ---------------------------------------- |
| `category`  | string    |         | Category slug. Unknown slug returns `[]` |
| `q`         | string    |         | Case-insensitive search in product name  |
| `limit`     | int 1-100 | 20      | Page size                                |
| `offset`    | int >= 0  | 0       | Items to skip                            |

```bash
curl "localhost:4200/api/products?category=ipa&limit=5"
curl "localhost:4200/api/products?q=gose"
```

### `GET /api/products/:id`

One product with its `category`.

- 404 if not found

## Users

### `POST /api/users`

Register a user. Password is hashed with scrypt.

| Field      | Type   | Rules                                 |
| ---------- | ------ | ------------------------------------- |
| `email`    | string | Valid email, stored lowercase, unique |
| `password` | string | 8 to 128 chars                        |
| `name`     | string | 1 to 100 chars (trimmed)              |

Returns `201` with a `User`.

- 409 if the email is already registered

```bash
curl -X POST localhost:4200/api/users \
  -H 'content-type: application/json' \
  -d '{"email":"alice@example.com","password":"supersecret","name":"Alice"}'
```

### `GET /api/users/:id`

One `User`.

- 404 if not found

## Orders

### `POST /api/orders`

Create an order. Runs in a single transaction:

1. checks the user exists
2. checks every product exists and has enough stock
3. computes the total from database prices (client prices are never trusted)
4. inserts the order and its items, decrements product stock

| Field               | Type  | Rules                                     |
| ------------------- | ----- | ----------------------------------------- |
| `userId`            | int   | Existing user                             |
| `items`             | array | At least 1 item, no duplicate `productId` |
| `items[].productId` | int   | Existing product                          |
| `items[].quantity`  | int   | 1 to 99, at most the product stock        |

Returns `201` with the full `Order` (items and products included). New orders are `pending`.

- 404 if the user does not exist
- 400 `Product <id> not found`
- 400 `Not enough stock for <product name>`

```bash
curl -X POST localhost:4200/api/orders \
  -H 'content-type: application/json' \
  -d '{"userId":1,"items":[{"productId":4,"quantity":3},{"productId":1,"quantity":2}]}'
```

### `GET /api/orders?userId=<id>`

Orders of one user, newest first, with `items` (without products). `userId` is required.

### `GET /api/orders/:id`

One `Order` with items and products.

- 404 if not found

### `PATCH /api/orders/:id/status`

```json
{ "status": "paid" }
```

Returns the updated `Order`.

- Moving to `cancelled` restores the stock of every item.
- A `cancelled` order cannot move to another status (400 `Cancelled orders cannot be reopened`).
- Other transitions are not restricted yet.
- 404 if the order does not exist
