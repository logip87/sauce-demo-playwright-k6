# Performance Report Notes

The executable performance report is generated at runtime into `lt/artifacts/k6/performance-report.md`.

## Default Scenario

- Target: `https://reqres.in/api/users?page=1`
- Concurrency model: 100 constant virtual users
- Pace: one request per loop, then a 1 second think time
- Duration: 2 minutes

## Why 2 Minutes?

For a public sample API, the goal is to gather stable percentile data without running an unnecessarily long or aggressive test. At 100 VUs and roughly 1 request per second per VU, a 2 minute run gives a meaningful request sample while keeping the exercise respectful of the shared target.

## Current Validation Gap

This workspace did not execute the k6 test because `k6` is not installed locally. Once `npm run lt:test` or the GitHub Actions load-test workflow runs, the generated markdown report becomes the authoritative artifact for captured metrics and interpretation.

## GitHub Pages Publishing

The manual `load-test` GitHub Actions workflow uploads the exported `dashboard.html` artifact to the repository GitHub Pages site under `/lt/k6/`. It also keeps `performance-report.md` and `summary.json` beside the dashboard for quick drill-down from the shared reports hub.
