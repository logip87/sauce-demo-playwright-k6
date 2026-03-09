# SauceDemo E2E Coverage Plan

## Goal

Build a broad, deterministic Playwright suite that covers the main user-facing behavior of SauceDemo without drifting into brittle or low-value checks.

## Coverage Areas

### Authentication

- successful login for the stable happy-path persona (`standard_user`)
- locked-out user handling
- invalid credentials handling
- required-field validation on the login form

### Inventory

- full catalog rendering
- stable sorting behavior for all four sort modes
- add/remove cart state directly from the inventory grid
- product details navigation and detail rendering
- logout flow from the side menu
- reset app state behavior
- footer link targets

### Cart

- selected items appear in the cart
- removing items updates cart state
- continue shopping returns to inventory with remaining cart state intact

### Checkout

- checkout can be started from the cart
- required-field validation for first name, last name, and postal code
- cancel behavior from checkout information and checkout overview
- overview metadata and pricing totals
- successful order completion and return to inventory

## Design Choices

- Page objects keep locators declared once and reused in methods.
- Tests use SauceDemo's `data-test` attributes wherever available.
- Each test creates its own state and avoids cross-test coupling.
- Seeded special personas such as `visual_user`, `problem_user`, `error_user`, and `performance_glitch_user` are intentionally excluded from the core passing smoke path. They belong in targeted characterization or known-bug suites.

## Deliberate Gaps

This suite focuses on deterministic browser behavior. It does not attempt visual regression, accessibility auditing, or backend contract validation. Those belong in adjacent quality layers, not this core E2E pack.
