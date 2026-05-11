# GitHub Actions CI Pipeline Acceptance

- [x] `.github/workflows/ci.yml` exists.
- [x] Workflow triggers on push and pull request for `master`.
- [x] Frontend job runs typecheck, Jest, web build, and smoke check.
- [x] Backend job installs dependencies and runs pytest.
- [x] Workflow does not reference production secrets.
- [x] Local equivalent validation commands pass before commit.
