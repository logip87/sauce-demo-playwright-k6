# TechLT QA Automation & Performance Assessment

This repository contains two parts of the assignment:

- `e2e/` for Playwright UI automation on SauceDemo
- `lt/` for k6 load testing on the ReqRes API

## Setup

### Prerequisites

- Node.js 22+
- npm
- Playwright Chromium browser
- k6 installed locally
- `REQRES_API_KEY` for the load test against ReqRes

### Install

```bash
npm install
npx playwright install chromium
```

### Load-Test Environment Variable

PowerShell:

```powershell
$env:REQRES_API_KEY="your_api_key"
```

## Run

E2E:

```bash
npm run e2e:test
```

Load test:

```bash
npm run lt:test
```

## What Was Implemented

### E2E

- Playwright project in strict TypeScript
- Page Object Model with reusable pages and fixtures
- Stable selectors based on SauceDemo `data-test` attributes
- Coverage for authentication, inventory, cart, checkout, and persona smoke flows
- Failure artifacts with Playwright HTML report, screenshots, traces, and Allure results

Main test files:

- `e2e/tests/auth.spec.ts`
- `e2e/tests/inventory.spec.ts`
- `e2e/tests/cart.spec.ts`
- `e2e/tests/checkout.spec.ts`
- `e2e/tests/persona-smoke.spec.ts`

### Load Testing

- k6 steady-state scenario for `https://reqres.in/api/users?page=1`
- Configurable runtime through environment variables such as VUs, duration, target URL, and target RPS
- Thresholds for response time and failure rate
- Automatic artifact generation:
  - `lt/artifacts/k6/summary.json`
  - `lt/artifacts/k6/performance-report.md`
  - `lt/artifacts/k6/dashboard.html`

### CI/CD

- GitHub Actions workflow for E2E on pull requests, pushes to `main`, and manual runs
- Separate manual workflow for load testing
- Artifact upload for both tracks
- GitHub Pages publishing for Allure and k6 reports
- Allure history preserved for trend reporting

## Useful Extra Commands

```bash
npm run lint
npm run typecheck
npm run e2e:test:headed
npm run e2e:report:html
npm run e2e:report:allure
```

## Notes

- UI artifacts are stored in `e2e/artifacts/`
- k6 artifacts are stored in `lt/artifacts/k6/`
- Load testing is manual by default to avoid hitting a third-party service on every push
