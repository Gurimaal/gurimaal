# Tenant Portal End-to-End Verification

Issue: `test: full tenant portal end-to-end verification #64`

## Goal

Verify the full Gurimaal Tenant Portal flow before production testing.

## Command

Run from `portal/`:

```bash
npm run test:e2e
```

The command checks the portal routes, shared layout, backend API endpoints, and tenant isolation helpers required by the checklist.

## Checklist

- Login works
- Dashboard loads real data
- Property page works
- Contract page works
- Billing page works
- Utility page works
- Maintenance request works
- Notifications work
- Profile works
- Mobile layout works
- Desktop layout works
- Tenant cannot access other tenant data

## Acceptance Criteria

Portal is ready for production testing when all checks pass and the normal portal build also succeeds.
