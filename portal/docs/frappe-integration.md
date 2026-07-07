# Gurimaal Portal and Frappe Integration

## Goal

Prepare a clean structure for connecting the React tenant portal to the Gurimaal Frappe backend.

## Repository map

- `gurimaal/` contains the Frappe app, DocTypes, hooks, server-side utilities and whitelisted API methods.
- `gurimaal/api/` contains tenant portal API endpoints grouped by feature.
- `gurimaal/api/utils.py` contains shared tenant permission helpers and response helpers.
- `portal/` contains the React/Vite tenant portal.
- `portal/src/api/` contains the frontend API client and feature-specific API wrappers.
- `portal/src/lib/auth.ts` stores the current portal session in browser storage.

## Backend API structure

Portal endpoints are exposed through whitelisted Frappe methods:

- `gurimaal.api.auth`
- `gurimaal.api.dashboard`
- `gurimaal.api.tenant`
- `gurimaal.api.property`
- `gurimaal.api.contract`
- `gurimaal.api.billing`
- `gurimaal.api.utility`
- `gurimaal.api.maintenance`
- `gurimaal.api.notifications`

Every protected endpoint should use helpers from `gurimaal/api/utils.py` to resolve the logged-in user, linked Tenant and tenant-owned records. The backend remains the source of truth for permissions, billing data and tenant isolation.

## Frontend API structure

The portal uses `portal/src/api/client.ts` as the single Frappe client. Feature files call Frappe methods by method path, for example:

```ts
apiClient.method("gurimaal.api.dashboard.summary");
```

The client sends requests with `credentials: "include"` so Frappe session cookies are included. In local development, Vite proxies `/api` to `VITE_FRAPPE_API_URL`, keeping browser requests same-origin and avoiding CORS/cookie issues. For deployed builds served from another domain, the browser can call `VITE_FRAPPE_API_URL` directly.

## Local setup

Run Frappe from the bench root:

```bash
cd $PATH_TO_YOUR_BENCH
bench start
```

Run the portal from this app:

```bash
cd $PATH_TO_YOUR_BENCH/apps/gurimaal/portal
npm install
npm run dev
```

Use `portal/.env.local` when the portal is served separately from Frappe:

```bash
VITE_FRAPPE_API_URL=http://localhost:8000
```

With `npm run dev`, the portal calls `/api/method/...` and Vite forwards those requests to the Frappe URL above. You can override only the dev proxy target with `VITE_FRAPPE_PROXY_TARGET` if needed.

## Deployment decision

Use a separate Vite portal for development and production testing.

Reasons:

- The frontend can be built and tested independently.
- The backend remains a normal Frappe app with whitelisted methods.
- Portal routes stay controlled by TanStack Router.
- The same API client can target local, staging or production Frappe sites through `VITE_FRAPPE_API_URL`.

Future option: build the portal and serve the static output through Frappe `public/www` if the project needs same-origin hosting.

## Verification

Run the integration checklist from the portal folder:

```bash
npm run test:e2e
```

Run backend migrations and tests from the bench root when DocTypes or server behavior changes:

```bash
bench --site <site> migrate
bench --site <site> run-tests --app gurimaal
```
