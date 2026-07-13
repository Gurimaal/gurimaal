### Gurimaal

Real estate and utility billing management for rental properties built on Frappe.

### Workspace structure

Gurimaal has two parts in this repository:

- `gurimaal/` — Frappe backend app, DocTypes, hooks, server APIs and utilities.
- `portal/` — React/Vite tenant portal that connects to Frappe through whitelisted API methods.

The tenant portal API layer calls backend methods under `gurimaal.api.*`. Shared backend helpers live in `gurimaal/api/utils.py`, and the frontend API client lives in `portal/src/api/client.ts`.

### Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app $URL_OF_THIS_REPO --branch version-16
bench install-app gurimaal
```

### Local development

Run the Frappe backend from the bench root:

```bash
cd $PATH_TO_YOUR_BENCH
bench start
```

In another terminal, run the portal from the app folder:

```bash
cd $PATH_TO_YOUR_BENCH/apps/gurimaal/portal
npm install
npm run dev
```

Create `portal/.env.local` when the portal runs on a separate Vite server:

```bash
VITE_FRAPPE_API_URL=http://localhost:8000
```

During local development Vite proxies `/api` to `VITE_FRAPPE_API_URL`, so the browser sends same-origin authenticated requests while Frappe remains available on port 8000. For production builds served from a different domain, set `VITE_FRAPPE_API_URL` to the public Frappe URL.

### Portal and Frappe integration

The integration plan is documented in `portal/docs/frappe-integration.md`.

Current deployment choice: keep the tenant portal as a separate Vite app during development and production testing. This keeps frontend iteration fast while the Frappe backend remains the source of truth for authentication, permissions and tenant-specific data. Serving the built portal from Frappe `public/www` can be added later if one-domain deployment becomes required.

Useful checks:

```bash
cd portal
npm run test:e2e
```

### Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/gurimaal
pre-commit install
```

Pre-commit is configured to use the following tools for checking and formatting your code:

- ruff
- eslint
- prettier
- pyupgrade

### License

mit
