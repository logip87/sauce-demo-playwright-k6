# AGENTS.md

## Intent

This repository contains a senior-level QA assessment split into:

- `e2e/` for Playwright UI automation
- `lt/` for k6 performance testing

Keep those concerns separate. Shared repo tooling lives at the root.

## Working Rules

- Stay in strict TypeScript. Avoid `any` unless a third-party type boundary makes it unavoidable.
- Prefer small, composable page objects and helpers over deep inheritance trees.
- Use stable locators first. On SauceDemo that means `data-test` selectors exposed through Playwright's `getByTestId`.
- Declare page locators as `readonly` members, then reuse them inside page methods and assertions.
- Do not introduce hard waits such as `waitForTimeout` or sleeps into UI tests.
- Favor Playwright expectations and URL assertions over manual polling.
- Keep tests deterministic, isolated, and readable. Each test should set up its own state.
- Put reusable setup in fixtures, not in brittle `beforeAll` chains.
- Load-test scripts must state the intended traffic model and document assumptions that affect interpretation.
- Treat third-party services politely. Keep aggressive load tests manual by default unless the target is owned by the team.

## Reporting

- Preserve Playwright HTML output for fast triage.
- Preserve Allure history so GitHub Pages shows trend data over time.
- Keep k6 run artifacts in `lt/artifacts/k6/` and UI artifacts in `e2e/artifacts/`.

## CI/CD

- CI should fail on lint, typecheck, or test regressions.
- PRs should run functional validation.
- Load tests should run manually or on explicitly approved schedules.
- Slack or Teams notifications should point to the failing workflow, report, and first useful failure artifact.