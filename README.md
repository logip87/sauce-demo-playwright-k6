# TechLT QA Automation & Performance Assessment

This repository is structured for the assessment as a clean, two-track QA project:

- `e2e/` contains Playwright UI automation for SauceDemo.
- `lt/` contains k6 load testing for the ReqRes users endpoint.

The setup favors deterministic tests, stable selectors, strict TypeScript, and CI-friendly reporting.

## Repository Layout

```text
.
|-- .github/workflows/     # CI, Pages deploy, and load-test runner
|-- .vscode/               # format and lint on save
|-- e2e/                   # Playwright project
|-- lt/                    # k6 project
|-- AGENTS.md              # repo-specific engineering guidance
|-- eslint.config.mjs
|-- package.json
`-- tsconfig.base.json
```

## Prerequisites

- Node.js 22+
- npm 10+ or another package-manager workflow that understands npm workspaces
- Playwright browser binaries: `npx playwright install --with-deps chromium`
- k6 for local load testing

If ReqRes rejects anonymous traffic, provide `REQRES_API_KEY` before running the load test. As of March 9, 2026, ReqRes documents `x-api-key` usage for `/api/*` endpoints.

## Install

```bash
npm install
npx playwright install --with-deps chromium
```

## Useful Commands

```bash
npm run lint
npm run typecheck
npm run e2e:test
npm run e2e:test:headed
npm run e2e:report:html
npm run e2e:report:allure
npm run lt:test
npm run lt:test:grafana
```

`npm run lt:test:grafana` publishes the same scenario to Grafana Cloud k6 when `K6_CLOUD_TOKEN` is available.

`npm run lt:test` writes:

- `lt/artifacts/k6/summary.json`
- `lt/artifacts/k6/performance-report.md`
- `lt/artifacts/k6/dashboard.html`

## Design Decisions

- Page Object Model: locators are declared once as `readonly` properties, then reused in action methods and assertions.
- Stable locators first: Playwright is configured to treat SauceDemo's `data-test` attribute as the test id source.
- Fixtures over inheritance: reusable page-object wiring lives in a custom Playwright fixture.
- No hard sleeps: assertions use Playwright's auto-waiting and web-first expectations.
- Separate folders by testing concern: UI automation and load testing evolve independently, but share repository standards.
- Reporting for humans and CI: Playwright HTML supports fast triage, while Allure provides GitHub Pages hosting with preserved history.

## CI/CD Approach

Playwright runs on pull requests and on pushes to `main`. The workflow uploads artifacts on every run and deploys the Allure v3 report to GitHub Pages for non-PR events.

Load testing is a manual pipeline by default. That is intentional: the target is a shared third-party endpoint, so steady-state tests should be opt-in rather than triggered on every commit.

## Failure Notifications

For team notifications, I would send a compact Slack or Teams message containing:

- workflow name and branch
- failing test or threshold name
- direct link to the GitHub Actions run
- direct link to the Playwright HTML or Allure report
- first actionable failure detail such as the assertion, screenshot, or trace

That keeps noise low while making triage fast.

## Quality Dashboard Signals

An end-to-end quality dashboard should include:

- build health and flaky-test rate
- E2E pass rate and mean time to repair
- performance percentiles and error rate
- deployment frequency and change failure rate
- synthetic check status for critical user journeys
- backend telemetry such as latency, saturation, and downstream dependency health

## What To Automate

Automate flows that are business-critical, repeat often, and have deterministic outcomes. Avoid automating flows that are highly visual, too volatile, or cheaper to cover with lower-level tests.

Functional testing owns correctness and workflow behavior. Performance testing owns latency, throughput, concurrency behavior, and degradation patterns under load. When a scenario needs both, split the intent: validate correctness first, then stress the same contract with performance tooling.

## E2E Coverage Plan

See e2e/docs/test-plan.md for the broader SauceDemo coverage matrix and the reasoning behind the added test areas.

