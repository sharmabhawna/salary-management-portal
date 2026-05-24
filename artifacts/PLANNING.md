# Salary Management Portal — Planning Document

> **Status:** Living document — updated as implementation reveals new constraints or better approaches.
> **Last updated:** 2026-05-24
> **Audience:** Engineers reviewing frontend architecture before the first feature commit.

---

## 1. Architecture Overview

### System Context

```
┌──────────────────────────────────────────────────────────────────────┐
│  Browser                                                             │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  salary-management-portal  (React 19 + Vite, :5173)           │ │
│  │                                                                │ │
│  │  ┌──────────┐  ┌─────────────────┐  ┌──────────────────────┐ │ │
│  │  │  NavBar  │  │  EmployeeList   │  │  InsightsDashboard   │ │ │
│  │  └──────────┘  └────────┬────────┘  └──────────┬───────────┘ │ │
│  │                         │                       │             │ │
│  │                  useEmployees             useInsights         │ │
│  │                  useEmployeeForm                              │ │
│  │                         │                       │             │ │
│  │                  employeeService         insightsService      │ │
│  │                         └──────────┬────────────┘             │ │
│  │                                 apiClient                     │ │
│  └─────────────────────────────────────┬──────────────────────── ┘ │
└─────────────────────────────────────────┼──────────────────────────  ┘
                                          │  HTTP /api/*
                                          │  dev:  Vite proxy → localhost:3000
                                          │  prod: VITE_API_URL env var
                                          ▼
                     ┌──────────────────────────────────────┐
                     │  salary-management-service           │
                     │  (Express 5 + TypeScript, :3000)     │
                     └──────────────────────────────────────┘
```

### Component Tree

```
App  (BrowserRouter)
│
├── NavBar
│   └── Links: "Employees" (/)  |  "Insights" (/insights)
│
├── Route "/"
│   └── EmployeeList
│       ├── Filter bar
│       │   ├── search input
│       │   ├── country select
│       │   ├── department select
│       │   └── employment type select
│       ├── Sortable table
│       │   └── Column headers (click to sort asc/desc)
│       ├── Pagination controls
│       ├── EmployeeForm  (modal — add / edit)
│       │   └── Controlled inputs for all employee fields
│       └── Delete confirmation dialog
│
└── Route "/insights"
    └── InsightsDashboard
        ├── Salary by Country  (select country → min / max / avg)
        ├── Average Salary by Job Title  (select country + title → avg)
        ├── Salary by Department  (table)
        └── Headcount by Country  (table)
```

### Data Flow

```
Component renders (EmployeeList / InsightsDashboard)
     │
     ▼
Custom Hook  (useEmployees / useInsights / useEmployeeForm)
├── Owns: data, loading, error, pagination state, filter state
├── Exposes: data + setter callbacks to component
└── Calls service functions on mount and on state change
     │
     ▼
Service function  (employeeService.ts / insightsService.ts)
├── Pure async function — no state, no side effects
├── Calls apiClient helpers (apiGet / apiPost / apiPut / apiDelete)
└── Returns typed response or throws on HTTP error
     │
     ▼
apiClient  (apiClient.ts)
├── Base URL: import.meta.env.VITE_API_URL  (default "/api")
└── fetch() with JSON headers; throws on non-2xx responses
     │
     ├── dev:  Vite dev server proxy  /api → http://localhost:3000
     └── prod: direct HTTPS to Railway service URL
```

### Test Data Flow

```
Vitest + React Testing Library renders component
     │
     ▼
Component calls hook → hook calls service → service calls apiClient → fetch()
     │
     ▼
MSW intercepts fetch at the network layer (service worker / Node handler)
     │
     ▼
handlers.ts returns mock JSON matching the real API response shape
     │
     ▼
Component receives mock data and renders
     │
     ▼
Test assertions run on the rendered DOM
```

---

## 2. Design Decisions

### Feature-Based Folder Structure

**Decision:** `src/features/employees/` and `src/features/insights/` rather than a flat `src/components/` or `src/pages/`.

**Why:**
- All files for an entity are co-located — `EmployeeList`, `EmployeeForm`, and `employeeOptions` change together when the employee feature changes.
- Scales without collision: adding a new feature (e.g. `src/features/reports/`) does not affect existing feature folders.
- Shared UI elements that span features (e.g. `NavBar`) live in `src/components/` — a clear distinction between feature-specific and cross-feature components.

---

### Custom Hooks for All Data Fetching

**Decision:** `useEmployees`, `useInsights`, and `useEmployeeForm` in `src/hooks/` — components never call service functions directly.

**Why:**
- Separation of concerns: components declare what to render, hooks own how to fetch and update.
- Hooks are independently testable with Vitest's `renderHook` without mounting a full component tree.
- Re-use: if a second component needs employee data in the future, it calls `useEmployees` instead of duplicating fetch logic.

**Trade-off accepted:** Hooks are stateful — mocking them in component tests requires either MSW (used here) or a hook mock. MSW was chosen so component tests exercise the full service → apiClient → fetch chain, not just the component in isolation.

---

### Services Layer Between Hooks and apiClient

**Decision:** Pure async functions in `src/services/` that map to typed API responses. Hooks call service functions; service functions call `apiClient`.

**Why:**
- Three testable seams instead of one: the hook's state management, the service's request/response mapping, and the API client's fetch configuration can each be tested independently.
- The service layer is the natural place to transform API shapes (e.g. snake_case → camelCase if the API contract ever changes) without touching hooks or components.
- `apiClient` can be replaced with a different HTTP library by updating one file without touching service or hook logic.

---

### No Global State Manager

**Decision:** Plain React `useState` and `useEffect` inside custom hooks. No Redux, Zustand, or React Query.

**Why:**
- The two feature domains (employees, insights) have no shared mutable state. There is no cross-feature mutation bus, no derived global state, and no optimistic update queue.
- Adding a state manager for two independent hooks introduces boilerplate that outweighs any benefit at this scale.
- React Query would be the most justified addition (caching, background re-fetch, stale-while-revalidate), but the app mutates data frequently and the simplicity of manual `useState` + re-fetch on submit is easier to reason about for a demo app.

**When to revisit:** Multiple components subscribing to the same employee list, cross-page state persistence, or real-time updates → Zustand (lightest option) or React Query (if caching and background sync are the main driver).

---

## 3. Trade-Off Explanations

### Vitest vs Jest

| | Vitest (chosen) | Jest |
|---|---|---|
| **ESM support** | Native — no transform config needed | Requires `babel-jest` or `ts-jest` + `--experimental-vm-modules` |
| **Vite integration** | Shares Vite config (alias `@/*`, `define`) | Separate transpile pipeline; aliases must be duplicated |
| **Speed** | esbuild-powered transform — fast cold start | Slower on large suites; relies on Babel or swc |
| **API** | Mirrors Jest (`describe`, `it`, `expect`, `vi.fn()`) — low migration cost | Jest-native |
| **Ecosystem** | Growing; most Jest plugins have Vitest equivalents | Mature; widest community support |

**Decision:** Vitest — the zero-config Vite integration means `@/*` path aliases and `import.meta.env` work in tests without duplication. The Jest-compatible API means almost no learning curve.

---

### MSW for API Mocking vs Mocking `apiClient` Directly

| | MSW (chosen) | Mock `apiClient` / `vi.mock` |
|---|---|---|
| **Test realism** | Intercepts actual `fetch()` — tests run the full service → apiClient path | Skips service and apiClient entirely |
| **Maintenance** | Handlers define API contracts in one place | Mocks scattered across every test file |
| **Error simulation** | `HttpResponse.error()` or status 500 handler simulates real network/HTTP errors | Manual throw injection; may not match real error shapes |
| **Type safety** | Handlers return the same shape as the real API | Must manually keep mock return types in sync |
| **Overhead** | MSW server setup in `tests/setup.ts` once per suite | Zero configuration |

**Decision:** MSW — the setup cost is a one-time `tests/mocks/` investment. Tests that exercise `fetch()` catch bugs in apiClient URL construction, header handling, and error parsing that `vi.mock` would silently ignore.

---

### React Router v7 vs TanStack Router

| | React Router v7 (chosen) | TanStack Router |
|---|---|---|
| **Maturity** | 10+ years; most widely deployed React router | Newer; growing ecosystem |
| **TypeScript** | Good; route params typed via convention | First-class: fully type-safe route params and search params |
| **File-based routing** | Optional (not used here — routes defined in `App.tsx`) | Built-in via file conventions |
| **Bundle size** | ~10 KB gzipped | ~12 KB gzipped |
| **Learning curve** | Familiar to most React developers | Newer API surface |

**Decision:** React Router v7 — two routes do not justify TanStack Router's setup overhead. If the app grows to 10+ routes with complex typed search params, TanStack Router's type-safety advantage becomes more compelling.

---

### Tailwind CSS v4 vs v3

| | Tailwind v4 (chosen) | Tailwind v3 |
|---|---|---|
| **Configuration** | CSS-first: `@import "tailwindcss"` in `index.css` — no `tailwind.config.js` | Requires `tailwind.config.js` for theme, content paths |
| **Vite integration** | `@tailwindcss/vite` plugin — single line in `vite.config.ts` | PostCSS plugin with separate config |
| **CSS output** | Lightning CSS; smaller, faster builds | PostCSS; slightly larger output |
| **Stability** | GA in 2025; breaking changes from v3 | Mature; widely documented |
| **Custom theme** | CSS variables in `@theme {}` block | `extend` in `tailwind.config.js` |

**Decision:** Tailwind v4 — no config file to maintain, simpler Vite integration. For a new project this is the forward-compatible choice.

**Trade-off accepted:** Some v3 community plugins and third-party component libraries have not yet migrated to v4. Custom theme values and `@apply` directives use new v4 syntax that differs from most documentation online.

---

### `PUT` (Full Replacement) for Employee Updates

This matches the service's decision — see [service PLANNING.md §6](../../salary-management-service/artifacts/PLANNING.md#put-for-updates-full-replacement) for the full comparison table.

From the portal's perspective: the edit modal always loads all fields from the existing employee record. Every field is pre-populated before the user submits — there is never a case where a field is "unknown" at submit time. Full replacement is the natural fit.

---

## 4. Performance Considerations

### Server-Side Pagination

All 10,000 employees are never fetched at once. `useEmployees` passes `page` and `limit` (default 20) as query parameters. The API returns `total` in the response envelope, allowing the portal to render "Page N of M" without a second request.

On every filter or sort change, `useEmployees` resets to `page: 1` and fires a new request. This keeps the UI consistent (no stale page numbers) at the cost of one extra request per filter interaction — acceptable given sub-10 ms API response times on local SQLite.

### No Client-Side Virtualization

At 20 rows per page the DOM never holds more than 20 employee table rows. Libraries like `react-window` or `@tanstack/react-virtual` add complexity only justified when rendering hundreds of rows simultaneously (e.g. an infinite scroll list). If the page size is ever increased significantly or a scrollable list replaces pagination, virtualization should be revisited.

### Re-Render Containment

- All filter state, pagination state, and employee data live in `useEmployees`. The `EmployeeList` component re-renders only when that hook's state changes — not on unrelated app-level state changes.
- The `EmployeeForm` modal is conditionally rendered (unmounted when closed) rather than hidden with CSS. This keeps the table DOM clean and avoids running form validation logic when the modal is not visible.
- `InsightsDashboard` uses `useInsights` which fires four independent requests in parallel on mount. Each insight section re-renders independently when its data resolves.

### Search Input and Request Volume

The search filter sends a new API request on every input change. At sub-10 ms SQLite latency this is imperceptible to the user. If the backend latency increases (remote database, slow network), a 300 ms debounce on the search input would reduce request volume without degrading user experience.

### Bundle Size

| Asset | Estimated size (gzipped) |
|---|---|
| React + React DOM | ~45 KB |
| React Router DOM | ~10 KB |
| Application code | ~15–25 KB |
| Tailwind CSS output | < 20 KB |
| **Total** | **< 120 KB** |

No charting library is used — insights are rendered as plain HTML tables, not SVG or canvas charts. This keeps the bundle small and avoids a heavyweight dependency for what is essentially four data tables.

Vite's production build (`npm run build`) performs tree-shaking and code splitting automatically. All dynamic imports resolve at build time for this app (no lazy-loaded routes).

### Test Performance

| Test type | Mechanism | Notes |
|---|---|---|
| Component tests | MSW + Testing Library | MSW server starts once per suite via `beforeAll` in `tests/setup.ts` |
| Hook tests | `renderHook` + MSW | No full component render needed |
| Service / utility tests | Direct function calls | No DOM, no network |
| Full coverage run | Vitest with `@vitest/coverage-v8` | v8 coverage is faster than Istanbul at instrumenting TS code |

Vitest runs test files in parallel worker threads by default, unlike Jest which serialises by default on small suites. The 100% coverage gate runs as part of the pre-commit hook (`npm run lint && npm run test:coverage`) to prevent regressions before every commit.

---

## Open Questions / Future Updates

- [ ] Debounce search input if API latency increases beyond local SQLite (~10 ms) to a remote database.
- [ ] Add React Query if caching, background re-fetch, or stale-while-revalidate behaviour is needed.
- [ ] Evaluate TanStack Router if the app grows to 10+ routes requiring typed search params.
- [ ] Add a loading skeleton (e.g. shimmer rows) in place of the current loading indicator for a smoother perceived performance on slower connections.

---

*This document will be updated as decisions are validated or revised during implementation.*
