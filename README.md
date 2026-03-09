# TechLT QA Automation & Performance Assessment

## Latest Reports URL

https://logip87.github.io/sauce-demo-playwright-k6/

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
npx playwright install
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

- k6 `constant-arrival-rate` scenario for `https://reqres.in/api/users?page=1`
- Fixed load profile: 100 requests/second for 2 minutes
- Thresholds for response time and failure rate

### CI/CD

- GitHub Actions workflow for E2E on pull requests, pushes to `main`, and manual runs
- Separate manual workflow for load testing
- Artifact upload for both tracks
- GitHub Pages publishing for Allure and k6 reports
- Allure history preserved for trend reporting

## Reflection & Seniority Check

### How would you integrate Playwright tests into CI/CD?

- Run lint, typecheck, and Playwright tests in GitHub Actions on every pull request
- Keep E2E sharded if the suite grows, but publish one combined HTML/Allure report for triage
- Run a smaller smoke subset on every PR and the fuller regression suite on merges to `main` or nightly
- Store screenshots, traces, videos, and HTML reports as artifacts so failures are actionable

### How would you notify the team (Slack/Teams) about failures or regressions?

- Send a workflow notification only on failure or when a previously green suite starts failing again
- Include the branch, commit, failed job, direct workflow link, and the first useful artifact/report link
- Keep the message short so the team can jump from chat straight into the failure details

### What observability metrics would you include in an end-to-end quality dashboard?

- Pass/fail rate and flaky test rate over time
- Test duration trends and slowest scenarios
- Failure reasons grouped by area such as login, cart, checkout, or environment issues
- Browser/environment coverage
- Release-over-release defect escape rate and open production incidents tied to missed coverage

### How would you decide what to automate?

- High-value, repeatable, business-critical flows such as login, checkout, and order confirmation
- Stable areas where assertions are clear and maintenance cost stays lower than manual effort
- Scenarios that are risky to ship broken and are needed often in CI regression

### What would you not automate?

- One-off exploratory checks better suited to human observation
- Very unstable flows still changing heavily each sprint
- Low-risk scenarios where test maintenance would cost more than the value of automation

### What belongs to performance vs functional testing?

- Functional tests verify correctness, user flows, validation, and business rules at normal usage levels
- Performance tests verify response times, throughput, error rates, and system behavior under sustained or peak load
- If the main question is "does it work?" it is functional; if the main question is "does it still work under load?" it is performance

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
