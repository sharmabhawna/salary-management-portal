# Salary Management Portal

Frontend portal for the Salary Management System, built with React, TypeScript, Vite, and Tailwind CSS.

## Tech Stack

- **React 19** — UI library
- **TypeScript** — strict mode enabled
- **Vite** — build tool and dev server
- **Tailwind CSS v4** — utility-first styling
- **Vitest** — test runner
- **React Testing Library** — component testing

## Prerequisites

- Node.js v20+
- The [salary-management-service](../salary-management-service) running on port 3000

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

Portal runs on http://localhost:5173 and proxies `/api` requests to the service on `:3000`.

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm test` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
├── components/     Shared reusable UI components
├── features/       Feature-scoped components and hooks
├── hooks/          Shared custom hooks
├── services/       API client and external integrations
├── types/          Shared TypeScript types
├── utils/          Pure utility functions
├── App.tsx         Root component
└── main.tsx        Entry point
tests/
├── setup.ts        Global test setup (jest-dom matchers)
└── ...             Mirrors src/ structure — tests/components/, tests/features/, etc.
```


## Development Approach

This project follows strict TDD — every change follows Red → Green → Refactor. See `.cursor/` for the full guidelines.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL for the service API | `/api` |