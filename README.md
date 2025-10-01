# Microservices

This repository contains two small Node.js microservices used together in a sample application:

- `auth` — Authentication service (users, sessions, addresses)
- `product` — Product service (product CRUD, image upload, seller-scoped routes)

Each service is a separate Node.js project (CommonJS). They use Express, Mongoose for MongoDB, and include Jest + Supertest for tests.

## Quick overview

- auth

  - Port: 8081 (set in `auth/server.js`)
  - Main route prefix: `/api/v1/auth`
  - Key features: register, login, logout, profile (`/me`), address CRUD

- product
  - Port: 3000 (default or via `PORT` env)
  - Main route prefix: `/api/v1/product`
  - Key features: create/read/update/delete products, image upload, seller endpoints

## Requirements

- Node.js 18+ recommended
- MongoDB instance (local or cloud)
- (Optional) Redis for session/token storage used by `auth` in non-test environments

## Environment variables

Each service loads environment variables with `dotenv`. Example variables used across the services:

- For auth service (`auth/.env` or environment):

  - `MONGODB_URL` — MongoDB connection string used by `auth`
  - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` — Redis connection (optional; a test-safe in-memory stub is used during tests)
  - `JWT_SECRET` — JSON Web Token secret used for signing tokens (if used by auth controllers)

- For product service (`product/.env` or environment):
  - `MONGO_URI` — MongoDB connection string used by `product`
  - `PORT` — Optional port override (default 3000)
  - ImageKit / storage keys if ImageKit or external upload is configured (see `product/src/services/imageKit.service.js`)

Create a `.env` file in each service root with the required values before running locally.

## Install & run (development)

Open two terminals (one per service) and run:

In `auth` folder:

```bash
cd auth
npm install
npm run dev
```

In `product` folder:

```bash
cd product
npm install
npm run dev
```

Each service exposes its API on the configured port. Use Postman or curl to talk to endpoints under `/api/v1/auth` and `/api/v1/product`.

## Run tests

Both services include Jest + Supertest tests. They use in-memory/mocked stores where appropriate (MongoDB memory server, Redis stub).

In each service run:

```bash
cd auth
npm test

cd ../product
npm test
```

Note: `auth` uses `cross-env NODE_ENV=test jest ...` to ensure tests run in a test environment.

## Important routes (examples)

Auth service (prefix `/api/v1/auth`):

- POST `/register` — register a user (validator middleware applied)
- POST `/login` — login and receive a token/cookie
- GET `/me` — get current user (requires authentication middleware)
- POST `/logout` — logout
- GET `/user/addresses` — list addresses (auth required)
- POST `/user/addresses` — add address (auth + validation)
- DELETE `/user/addresses/:addressID` — delete address (auth + validation)

Product service (prefix `/api/v1/product`):

- POST `/` — create product (requires role `admin` or `seller`, accepts up to 5 images with field name `images`)
- GET `/` — list products
- GET `/:id` — get product by id
- PATCH `/:id` — update product (requires role `admin` or `seller`)
- DELETE `/:id` — delete product (requires role `admin` or `seller`)
- GET `/seller/:sellerId` — products for a seller (requires `seller` role)

## Tests and development notes

- The `auth` service provides a simple Redis stub during tests so tests don't require a live Redis instance.
- Both services use `mongodb-memory-server` for fast, isolated MongoDB tests.
- Validators and auth middleware are implemented in each service; check `src/middleware` and `src/middlewares` for details.

## Suggested next improvements

- Add service-level README.md files under `auth/` and `product/` with service-specific env examples and detailed endpoint docs.
- Add docker-compose to run MongoDB and Redis locally for easy demo runs.
- Add OpenAPI/Swagger documentation for both services.

## Contact / Contribution

Contributions welcome. Open issues or PRs in this repository.
