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
| `DATABASE_URL` | `file:./prod.db` |
| `PORT`         | `3000`                                         |
| `NODE_ENV`     | `production`                                   |
| `CORS_ORIGIN`  | Your Vercel portal URL, e.g. `https://your-portal.vercel.app` |

### Build & start commands

| Field | Value |
| --- | --- |
| **Build command** | `npm run build` |
| **Pre-deploy command** | `npx prisma migrate deploy && npm run db:seed` |
| **Start command** | `npm start` |

Set the pre-deploy command in Railway → your service → **Settings → Deploy → Pre-deploy command**.

Two npm lifecycle hooks also run automatically:
- `postinstall` → runs `prisma generate` after `npm install`, so the Prisma client is always generated before TypeScript compilation.
- `prestart` → runs `prisma migrate deploy && npm run db:seed` before `node dist/index.js` as a safety net in case the pre-deploy step is removed or skipped. This means migrations are applied and the database is re-seeded with 10,000 employees on every container start.

### SQLite persistence and seeding note

Railway's filesystem is **ephemeral** — every container restart begins with a blank filesystem. This means:

- The `pre-deploy` command runs **inside the container that will serve traffic**, so migrations and seed data written there are available to the live service.
- `railway run <command>` and the Railway Shell open **separate isolated containers** — writes to `prod.db` there do **not** reach the running service. Do not use them to seed.
- On every redeploy the database is reset and re-seeded with 10,000 employees. This is intentional for a demo deployment.

For persistent data across restarts, attach a Railway **Volume** and update `DATABASE_URL` to the volume mount path (e.g. `file:/data/prod.db`). Remove `npm run db:seed` from the pre-deploy command when using a volume.

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
- [ ] Pre-deploy command is set to `npx prisma migrate deploy && npm run db:seed` — migrations and seed run automatically on every deploy inside the live container.
- [ ] Visit the portal URL and confirm the employee list loads 10,000 employees without CORS or network errors.
