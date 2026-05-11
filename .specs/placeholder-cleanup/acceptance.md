# Acceptance

- Obsolete placeholders are removed or replaced with real feature entry points.
- Active placeholders remain where features are not implemented yet.
- TypeScript typecheck and relevant tests pass.

## Verification

- `npm run typecheck`
- `npm test -- --runInBand`
- `cd backend && python -m pytest -q`
