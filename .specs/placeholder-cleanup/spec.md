# Placeholder Cleanup

## Goal
Remove placeholder copy/UI/code paths that are obsolete because the corresponding Garden Roof Deck / AI Garden feature is now implemented.

## Scope
- Scan frontend, backend, docs, specs, and scripts for placeholder/TODO/coming-soon language.
- Keep placeholders that still describe unimplemented or intentionally deferred work.
- Prefer small copy/code cleanup over broad refactors.

## Non-goals
- Do not implement new feature behavior during this cleanup.
- Do not remove intentionally documented roadmap items from specs.
- Do not remove test doubles/mocks that are actively used by tests.
