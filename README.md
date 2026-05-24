# Salary Management Portal

Frontend portal for the Salary Management System. HR managers use it to browse and manage employees and view salary and headcount insights. Built with React, TypeScript, Vite, and Tailwind CSS.

## Tech Stack

- **React 19** — UI library
- **TypeScript** — strict mode enabled
- **Vite** — build tool and dev server
- **Tailwind CSS v4** — utility-first styling
- **React Router** — client-side routing
- **Vitest** — test runner
- **React Testing Library** — component testing
- **MSW** — API mocking in tests
- **Husky** — pre-commit hooks (lint + 100% coverage gate)

## Features

### Employees (`/`)

- Sortable, paginated employee table with column sort indicators
- Filters for search, country, department, and employment type
- Add and edit employees via modal form
- Delete with confirmation dialog
- Job title, department, country, and employment type fields use predefined dropdowns

### Insights (`/insights`)

- **Salary by country** — min, max, and average for a selected country
- **Average salary by job title** — select job title and country, then view average
- **Salary by department** — table of average salary per department
- **Headcount by country** — table sorted by count descending

### Navigation

Top navigation bar with links to Employees and Insights, with active route highlighting.

## Prerequisites

- Node.js v20+
- Git (required for Husky pre-commit hooks)
- The [salary-management-service](../salary-management-service) running on port 3000

## Getting Started

**Step 1 — Start the backend** (in a separate terminal, inside `salary-management-service/`):

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed   # optional — seeds 10,000 employees
npm run dev
```

**Step 2 — Start the portal**:

```bash
# Install dependencies
npm install

# Start the portal
npm run dev
```

The portal runs at http://localhost:5173. The Vite dev server automatically proxies all `/api` requests to the service on port 3000 — no extra configuration needed.

> **Note:** A `.env` file is not required for local development. If you want to point the portal at a different backend URL (e.g. for a production build), copy the example and set the variable:
>
> ```bash
> cp .env.example .env
> # Then edit VITE_API_URL in .env
> ```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report (100% threshold) |
| `npm run test:ui` | Open Vitest UI |
| `npm run lint` | Run ESLint |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
├── components/     Shared UI components (NavBar)
├── features/
│   ├── employees/  EmployeeList, EmployeeForm, options
│   └── insights/   InsightsDashboard
├── hooks/          Data-fetching hooks (useEmployees, useInsights, useEmployeeForm)
├── services/       API client and service functions
├── types/          Shared TypeScript types
├── utils/          Pure utility functions (formatting, validation)
├── App.tsx         Route definitions
└── main.tsx        Entry point (BrowserRouter)
tests/
├── helpers/        Shared test utilities (renderWithRouter)
├── mocks/          MSW handlers and mock data
├── setup.ts        Global test setup (jest-dom, MSW server)
└── ...             Mirrors src/ — tests/components/, tests/features/, etc.
```

## Routes

| Path | Component | Description |
|---|---|---|
| `/` | `EmployeeList` | Employee table with CRUD |
| `/insights` | `InsightsDashboard` | Salary and headcount insights |

## Development Approach

This project follows strict TDD — every change follows Red → Green → Refactor. Pre-commit hooks run ESLint and the full test suite with a 100% coverage gate. See `.cursor/` for guidelines.

Tests live in `tests/` (not co-located with source). Components that depend on routing are wrapped in `MemoryRouter` via the `renderWithRouter` helper.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL for the service API | `/api` (proxied to `localhost:3000` in dev) |

In development, the Vite dev server proxies `/api` to the backend automatically — no `.env` file needed. In production (Vercel), set `VITE_API_URL` to the full Railway service URL (e.g. `https://your-service.up.railway.app/api`) in the Vercel dashboard environment variables.
