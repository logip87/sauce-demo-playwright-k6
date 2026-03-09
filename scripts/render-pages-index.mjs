import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const siteDir = path.resolve(process.cwd(), process.argv[2] ?? 'site');

const e2eReportPath = path.join(siteDir, 'e2e', 'index.html');
const e2eArchivesPath = path.join(siteDir, 'e2e', 'runs', 'index.html');
const loadTestDashboardPath = path.join(siteDir, 'lt', 'k6', 'index.html');
const loadTestMarkdownPath = path.join(siteDir, 'lt', 'k6', 'performance-report.md');
const loadTestSummaryPath = path.join(siteDir, 'lt', 'k6', 'summary.json');

const hasE2eReport = existsSync(e2eReportPath);
const hasE2eArchives = existsSync(e2eArchivesPath);
const hasLoadTestDashboard = existsSync(loadTestDashboardPath);
const hasLoadTestMarkdown = existsSync(loadTestMarkdownPath);
const hasLoadTestSummary = existsSync(loadTestSummaryPath);

const renderLinks = () => {
  const links = ['<a href="./lt/k6/">Open dashboard</a>'];

  if (hasLoadTestMarkdown) {
    links.push('<a href="./lt/k6/performance-report.md">Markdown summary</a>');
  }

  if (hasLoadTestSummary) {
    links.push('<a href="./lt/k6/summary.json">Raw summary JSON</a>');
  }

  return links.join('<span class="divider">|</span>');
};

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>QA Reports</title>
    <style>
      :root {
        color-scheme: light;
        --background: #f3efe7;
        --panel: rgba(255, 252, 245, 0.92);
        --panel-border: rgba(37, 52, 63, 0.14);
        --text: #1f2a33;
        --muted: #55636f;
        --accent: #0f766e;
        --accent-soft: rgba(15, 118, 110, 0.12);
        --shadow: 0 24px 50px rgba(31, 42, 51, 0.12);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Segoe UI", "Trebuchet MS", sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(15, 118, 110, 0.14), transparent 26rem),
          radial-gradient(circle at bottom right, rgba(180, 83, 9, 0.14), transparent 24rem),
          linear-gradient(180deg, #faf7f0 0%, var(--background) 100%);
      }

      main {
        width: min(72rem, calc(100% - 2rem));
        margin: 0 auto;
        padding: 3rem 0 4rem;
      }

      h1 {
        margin: 0 0 0.75rem;
        font-size: clamp(2.4rem, 6vw, 4.5rem);
        line-height: 0.95;
        letter-spacing: -0.05em;
      }

      p {
        margin: 0;
        line-height: 1.6;
      }

      .lede {
        max-width: 42rem;
        color: var(--muted);
        font-size: 1.05rem;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
        gap: 1rem;
        margin-top: 2rem;
      }

      .card {
        padding: 1.35rem;
        border: 1px solid var(--panel-border);
        border-radius: 1.25rem;
        background: var(--panel);
        box-shadow: var(--shadow);
        backdrop-filter: blur(12px);
      }

      .label {
        display: inline-flex;
        padding: 0.3rem 0.65rem;
        border-radius: 999px;
        background: var(--accent-soft);
        color: var(--accent);
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      h2 {
        margin: 0.9rem 0 0.6rem;
        font-size: 1.45rem;
      }

      .description {
        color: var(--muted);
      }

      .status {
        margin-top: 1rem;
        font-weight: 600;
      }

      .links {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 1rem;
      }

      a {
        color: var(--accent);
        font-weight: 600;
        text-decoration: none;
      }

      a:hover,
      a:focus-visible {
        text-decoration: underline;
      }

      .divider {
        color: rgba(85, 99, 111, 0.45);
      }

      footer {
        margin-top: 2rem;
        color: var(--muted);
        font-size: 0.95rem;
      }
    </style>
  </head>
  <body>
    <main>
      <p class="label">GitHub Pages Hub</p>
      <h1>QA reports in one place.</h1>
      <p class="lede">
        This site keeps the Playwright and k6 outputs side by side so either pipeline can publish without overwriting the other.
      </p>

      <section class="grid" aria-label="Published reports">
        <article class="card">
          <p class="label">E2E</p>
          <h2>Allure report</h2>
          <p class="description">
            Functional regression history and the latest Playwright execution details.
          </p>
          ${
            hasE2eReport
              ? `<p class="status">Published.</p><p class="links"><a href="./e2e/">Open report</a>${
                  hasE2eArchives ? '<span class="divider">|</span><a href="./e2e/runs/">Archived reports</a>' : ''
                }</p>`
              : '<p class="status">Not published yet.</p>'
          }
        </article>

        <article class="card">
          <p class="label">Load Test</p>
          <h2>k6 dashboard</h2>
          <p class="description">
            Latest exported HTML dashboard from the manual load-test workflow.
          </p>
          ${
            hasLoadTestDashboard
              ? `<p class="status">Published.</p><p class="links">${renderLinks()}</p>`
              : '<p class="status">Not published yet.</p>'
          }
        </article>
      </section>

      <footer>
        Rebuild this index from either Pages deployment job to keep both report tracks discoverable.
      </footer>
    </main>
  </body>
</html>
`;

mkdirSync(siteDir, { recursive: true });
writeFileSync(path.join(siteDir, 'index.html'), html, 'utf8');
