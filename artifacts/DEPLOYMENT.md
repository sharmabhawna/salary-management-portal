# Deployment Guide

This document covers deploying the **salary-management-service** to [Railway](https://railway.app) and the **salary-management-portal** to [Vercel](https://vercel.com).

---

## 1. Service → Railway

### Steps

1. Go to [railway.app](https://railway.app) and create a new project.
2. Click **Deploy from GitHub repo** and connect your `salary-management-service` repository.
3. Railway will detect the Node.js project automatically.

### Environment variables

Set the following in the Railway service's **Variables** tab:

| Variable       | Value                                          |
| -------------- | ---------------------------------------------- |
| `DATABASE_URL` | `file:./data/prod.db` (or your preferred path) |
| `PORT`         | `3000`                                         |
| `NODE_ENV`     | `production`                                   |
| `CORS_ORIGIN`  | Your Vercel portal URL, e.g. `https://your-portal.vercel.app` |

### Build & start commands

Railway reads these from `package.json` automatically:

- **Build command:** `npm run build`
- **Start command:** `npm start`

Two npm lifecycle hooks run automatically without any extra configuration:
- `postinstall` → runs `prisma generate` after `npm install`, so the Prisma client is always generated before TypeScript compilation.
- `prestart` → runs `prisma migrate deploy` before `node dist/index.js`, so database migrations are always applied on every container start. This is important on Railway because the filesystem is ephemeral — a fresh container gets a blank SQLite file, and `prestart` ensures the schema is created before the app tries to query it.

### SQLite persistence note

Railway's filesystem is **ephemeral** — data is lost on redeploy unless you attach a persistent volume. In the Railway dashboard, go to your service → **Volumes** and mount a volume at the path used in `DATABASE_URL` (e.g. `/app/data`). Update `DATABASE_URL` to match the mount path (`file:/app/data/prod.db`).

---

## 2. Portal → Vercel

### Steps

1. Go to [vercel.com](https://vercel.com) and create a new project.
2. Click **Import Git Repository** and connect your `salary-management-portal` repository.
3. Vercel will detect the Vite project automatically.

### Environment variables

Set the following in the Vercel project's **Settings → Environment Variables**:

| Variable        | Value                                       |
| --------------- | ------------------------------------------- |
| `VITE_API_URL`  | Your Railway service URL, e.g. `https://salary-management-service.up.railway.app/api` |

### Build settings

| Setting           | Value         |
| ----------------- | ------------- |
| **Build command** | `npm run build` |
| **Output directory** | `dist`     |

---

## 3. Connection checklist

After both services are deployed, verify the following before testing end-to-end:

- [ ] `CORS_ORIGIN` on the Railway service is set to the **exact** Vercel portal URL (e.g. `https://your-portal.vercel.app`, no trailing slash).
- [ ] `VITE_API_URL` on the Vercel portal is set to the **exact** Railway service URL including `/api` (e.g. `https://salary-management-service.up.railway.app/api`).
- [ ] Database migrations run automatically on every `npm start` via the `prestart` hook — no manual step needed.
- [ ] Optionally seed initial data:
  ```
  npm run db:seed
  ```
- [ ] Visit the portal URL and confirm the employee list loads without CORS or network errors.
