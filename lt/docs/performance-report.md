# Performance Report Notes

The executable performance report is generated at runtime into `lt/artifacts/k6/performance-report.md`.

## Fixed Scenario

- Target: `https://reqres.in/api/users?page=1`
- Traffic model: `constant-arrival-rate`
- Pace: 100 requests per second
- Duration: 2 minutes
- VU pool: 100 pre-allocated VUs, up to 200 max VUs

## Why 2 Minutes?

For a public sample API, the goal is to gather stable percentile data without running an unnecessarily long or aggressive test. At 100 requests per second for 2 minutes, the scenario produces a meaningful sample while still keeping the exercise manual and intentional for a shared third-party target.

## Runtime Input

- Required: `REQRES_API_KEY`
- The rest of the scenario is intentionally static in code

## Current Validation Gap

This workspace did not execute the k6 test because `k6` is not installed locally. Once `npm run lt:test` or the GitHub Actions load-test workflow runs, the generated markdown report becomes the authoritative artifact for captured metrics and interpretation.

## GitHub Pages Publishing

The manual `load-test` GitHub Actions workflow can still export `dashboard.html` for GitHub Pages publication. It also keeps `performance-report.md` and `summary.json` beside the dashboard for quick drill-down from the shared reports hub.
