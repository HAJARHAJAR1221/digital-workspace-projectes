# Backend + database setup (to log in)

## 1. Install MongoDB

- Install MongoDB Community and start the service, **or**
- Use MongoDB Atlas: create a free cluster, get a connection string, and set `MONGO_URI` in `.env`.

## 2. Environment

Ensure the backend has a `.env` (copy from `.env.example` or use `backend/src/.env`). Required:

- `MONGO_URI=mongodb://127.0.0.1:27017/smart_workspace` (or your Atlas URL)
- `JWT_SECRET` (any long random string)
- `PORT=5001` (optional, default 5001)

## 3. Create login users (seed)

From the **backend** folder run:

```bash
npm run seed
```

If that script is not in `package.json`, run:

```bash
node src/seed.js
```

This creates demo users. **Password for all: `demo`**

| Email               | Role      |
|---------------------|-----------|
| admin@agency.com    | admin     |
| manager@agency.com  | manager   |
| dev@agency.com      | developer |
| designer@agency.com | designer  |

## 4. Start the backend

```bash
npm run dev
```

or:

```bash
node src/server.js
```

You should see: `MongoDB connected` then `Server running on port 5001`.  
If you see a MongoDB connection error, check that MongoDB is running and `MONGO_URI` is correct.

## 5. Log in from the app

- Frontend: `http://localhost:8080` (or 5173)
- Use **admin@agency.com** / **demo** (or any of the other seeded emails with password `demo`).
