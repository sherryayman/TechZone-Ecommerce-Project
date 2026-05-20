# TechZone — Electronics Store

A full-stack e-commerce demo built with the MERN stack (MongoDB, Express, React, Node.js). The UI is in Arabic with right-to-left layout. This repository is the cleaned, audited rewrite of an earlier version.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Setup](#setup)
   - [1. Install MongoDB](#1-install-mongodb)
   - [2. Backend setup](#2-backend-setup)
   - [3. Frontend setup](#3-frontend-setup)
5. [Demo Credentials](#demo-credentials)
6. [API Reference](#api-reference)
7. [Common Errors](#common-errors)
8. [What Was Fixed in This Rewrite](#what-was-fixed-in-this-rewrite)

---

## Tech Stack

**Backend**: Node.js, Express 4, Mongoose 7, JWT, bcryptjs, helmet, express-rate-limit, express-validator
**Frontend**: React 18, Vite 4, React Router 6, Axios, react-hot-toast, react-icons
**Database**: MongoDB

---

## Project Structure

```
electronics-store/
├── backend/
│   ├── middleware/
│   │   ├── auth.js          JWT auth + admin gate
│   │   └── error.js         async wrapper + central error handler
│   ├── models/
│   │   ├── User.js          users (with password hashing)
│   │   ├── Product.js       products + reviews
│   │   └── Order.js         orders + line items
│   ├── routes/
│   │   ├── auth.js          /api/auth/*
│   │   ├── products.js      /api/products/*
│   │   ├── orders.js        /api/orders/*
│   │   └── admin.js         /api/admin/* (admin-only)
│   ├── server.js            Express app entry
│   ├── seed.js              one-shot DB seeder
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/      Navbar, Footer, ProductCard, CartDrawer
    │   ├── context/         AuthContext, CartContext
    │   ├── pages/           Home, Products, ProductDetail, Login, Register, Payment, Orders, Admin
    │   ├── utils/api.js     Axios instance with token injection
    │   ├── App.jsx          Router + providers
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Prerequisites

- **Node.js 18 or higher** (`node -v` to check)
- **npm** (comes with Node)
- **MongoDB 6 or higher** (running locally on the default port `27017`, or a connection string to MongoDB Atlas)

---

## Setup

### 1. Install MongoDB

You need a running MongoDB server before starting the backend. Pick the easiest option:

#### Option A — Local install

- **macOS** (Homebrew):
  ```
  brew tap mongodb/brew
  brew install mongodb-community
  brew services start mongodb-community
  ```
- **Ubuntu/Debian**: follow the official guide at <https://www.mongodb.com/docs/manual/administration/install-on-linux/>
- **Windows**: download the MSI installer from <https://www.mongodb.com/try/download/community>, then start the `MongoDB` service from Services.

After installation, MongoDB listens on `mongodb://localhost:27017`.

#### Option B — MongoDB Atlas (cloud, free tier)

1. Sign up at <https://www.mongodb.com/cloud/atlas>.
2. Create a free cluster.
3. Create a database user (Database Access → Add New Database User).
4. Allow your IP (Network Access → Add IP Address → "Allow Access From Anywhere" for development).
5. Click **Connect → Drivers** and copy the connection string. It looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/electronics-store`

#### Option C — Docker

```
docker run -d --name techzone-mongo -p 27017:27017 mongo:7
```

### 2. Backend setup

```
cd backend
npm install
cp .env.example .env
```

Open `.env` in your editor. The important variables:

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | yes | Connection string. For local: `mongodb://localhost:27017/electronics-store`. For Atlas: paste the URI from step 1. |
| `JWT_SECRET` | yes | A long random string. **The server will refuse to start if this is missing.** Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. |
| `JWT_EXPIRES_IN` | no | Token lifetime, e.g. `30d` (default) or `7d`. |
| `PORT` | no | Backend port (default `5000`). |
| `CLIENT_URL` | no | Origin allowed by CORS in production. Defaults to `http://localhost:5173` in development. |
| `NODE_ENV` | no | `development` or `production`. |

Seed the database with sample products and the demo users:

```
npm run seed
```

Then start the API:

```
npm run dev          # nodemon, auto-restart
# or
npm start            # plain node
```

You should see:

```
✅ MongoDB connected
✅ Server running on http://localhost:5000
```

### 3. Frontend setup

In a **second terminal**:

```
cd frontend
npm install
npm run dev
```

The frontend opens on <http://localhost:5173>. Vite's dev server proxies `/api/*` requests to `http://localhost:5000`, so no extra config is needed for development.

---

## Demo Credentials

The seed script creates two accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@techstore.com` | `admin123` |
| User | `ahmed@example.com` | `password123` |

Login at <http://localhost:5173/login>. The admin account can access `/admin` for the dashboard.

---

## API Reference

All endpoints are prefixed with `/api`. Endpoints marked 🔒 require a `Authorization: Bearer <token>` header. Endpoints marked 👑 require an admin token.

### Auth — `/api/auth`

| Method | Path | Body | Description |
| --- | --- | --- | --- |
| POST | `/register` | `{ name, email, password }` | Create account, returns `{ user, token }` |
| POST | `/login` | `{ email, password }` | Login, returns `{ user, token }` |
| GET | `/me` 🔒 | — | Current user from token |
| PUT | `/profile` 🔒 | `{ name?, email?, password?, currentPassword? }` | Update profile. **`currentPassword` is required when changing the password.** |

```
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techstore.com","password":"admin123"}'
```

### Products — `/api/products`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | List products. Supports `category`, `brand` (CSV), `minPrice`, `maxPrice`, `minRating`, `search`, `sort` (`price_asc`, `price_desc`, `rating`, `newest`), `page`, `limit`, `featured`. |
| GET | `/categories` | Distinct list of categories. |
| GET | `/featured` | Up to 8 featured products. |
| GET | `/:id` | Single product (with populated review users). |
| POST | `/:id/reviews` 🔒 | Body: `{ rating: 1-5, comment }`. One review per user per product. |

```
curl 'http://localhost:5000/api/products?category=iPhone&sort=price_asc&page=1&limit=12'
```

### Orders — `/api/orders`

| Method | Path | Description |
| --- | --- | --- |
| POST | `/` 🔒 | Create order. Body: `{ items: [{product, quantity}], shippingAddress, paymentMethod }`. Validates stock atomically — never partially decrements. |
| GET | `/myorders` 🔒 | Current user's orders, newest first. |
| GET | `/:id` 🔒 | Single order. Owner or admin only. |
| PUT | `/:id/pay` 🔒 | Mark as paid. Owner only; rejects if already paid. |

### Admin — `/api/admin` 👑

| Method | Path | Description |
| --- | --- | --- |
| GET | `/stats` | Dashboard counters + recent orders + monthly sales. |
| GET / POST | `/products` | List / create products. |
| PUT / DELETE | `/products/:id` | Update / delete. |
| GET | `/orders` | All orders (with users populated). |
| PUT | `/orders/:id/status` | Body: `{ status }`. Allowed values: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`. |
| GET | `/users` | All users (no passwords). |
| DELETE | `/users/:id` | Delete user. Cannot delete yourself. |

---

## Common Errors

**"❌ FATAL: JWT_SECRET environment variable is required"**
You skipped step 2's `.env` setup, or `JWT_SECRET` is empty. Generate one:
```
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
and paste it into `backend/.env`.

**"MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017"**
MongoDB isn't running. On macOS: `brew services start mongodb-community`. On Linux: `sudo systemctl start mongod`. On Windows: start the MongoDB service. If using Atlas, double-check `MONGO_URI` and that your IP is whitelisted.

**"Port 5000 already in use" / "EADDRINUSE"**
Something is already on port 5000. Either kill it (`lsof -i :5000` then `kill <pid>`) or change `PORT` in `backend/.env`. If you change the backend port, also update `vite.config.js` `proxy.target`.

**"CORS error" in browser console**
The backend allow-list defaults to `http://localhost:5173`. If you run the frontend on a different origin, set `CLIENT_URL` in `backend/.env` to match.

**"Cannot read property 'name' of null" right after login**
Old token from a previous session. Open DevTools → Application → Local Storage → delete the `token` key, then refresh.

**Empty product page**
You haven't run the seeder. From `backend/`: `npm run seed`.

**"Email already registered"**
Either log in instead, or drop the database and re-seed: `mongosh electronics-store --eval "db.dropDatabase()"` then `npm run seed`.

---

## What Was Fixed in This Rewrite

This version corrects several issues found in the audit of the original codebase:

**Backend**

- **Stock decrement race**: orders now validate every item, create the order, and only then decrement stock — instead of decrementing inside the validation loop, which could partially mutate stock if a later item failed.
- **JWT secret fallback removed**: the server now refuses to start without `JWT_SECRET`, instead of silently signing tokens with the literal string `'secret'`.
- **Profile password change** now requires `currentPassword`, preventing token-theft → account takeover.
- **Admin self-delete blocked** to prevent locking the system out.
- **Order status enum validated** server-side before saving.
- **ObjectId validation** on every `/:id` route — invalid IDs return 400 instead of crashing Mongoose.
- **Helmet + rate limiting** added (auth endpoints are rate-limited to 30 requests / 15 min per IP).
- **CORS allow-list** instead of wildcard.
- **Centralized error handler** with mongoose-aware error mapping.
- **Seed script** uses `User.create` per user so password hashing actually runs (the old `insertMany` skipped the pre-save hook).

**Frontend**

- **401 redirect loop fixed**: the axios interceptor no longer redirects to `/login` when the silent `/auth/me` bootstrap call returns 401, or when the user is already on `/login` or `/register`.
- **Filter race fixed in `ProductsPage`**: filters and URL search params are now derived from a single source (the URL), eliminating the desync that could fire stale fetches.
- **Navbar dropdown** now closes on outside click (`useRef` + `mousedown` listener).
- **`Number('')` → `NaN` bug** in the admin product form is fixed via a `num()` helper that returns `0` for empty/invalid input.
- **Defensive number formatting** everywhere prices are displayed.
- **Cart caps quantity to product stock** when known.
- **Cancellable fetches**: `HomePage`, `ProductDetailPage`, `ProductsPage`, `OrdersPage`, and `AdminPage` all guard against state updates after unmount.
- **AdminRoute** centralizes the admin role check; pages no longer duplicate it.

---

## Available Scripts

### Backend (`/backend`)
- `npm run dev` — start with nodemon
- `npm start` — production-style run
- `npm run seed` — wipe + seed the database

### Frontend (`/frontend`)
- `npm run dev` — Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally

---

## License

This is a learning/demo project. Use it however you like.
