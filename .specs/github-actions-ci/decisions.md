# GitHub Actions CI Pipeline Decisions

- Use separate frontend and backend jobs for clearer failure isolation.
- Use `npm ci` rather than `npm install` for reproducible frontend installs.
- Use Python 3.12 for backend CI because `backend/pyproject.toml` requires `>=3.12`.
- Do not add deployment or image publishing to this initial CI spec.
- Do not rely on real `.env` files or provider API secrets in CI.
