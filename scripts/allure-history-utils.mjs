import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const DEFAULT_REPORT_ID = 'awesome';

const REPORT_OPTIONS_PATTERN = /window\.allureReportOptions = (\{.*?\})/s;

const formatTimestamp = (timestamp) =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(timestamp));

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

export const archiveUrlForRun = (baseUrl, reportUuid) => `${baseUrl.replace(/\/$/, '')}/e2e/runs/${reportUuid}`;

export const getPagesBaseUrl = async ({ pagesDir, repository }) => {
  const customDomainPath = path.join(pagesDir, 'CNAME');

  if (existsSync(customDomainPath)) {
    const customDomain = (await readFile(customDomainPath, 'utf8')).trim();

    if (customDomain) {
      return `https://${customDomain}`;
    }
  }

  if (!repository?.includes('/')) {
    throw new Error('GITHUB_REPOSITORY must be set to compute the GitHub Pages URL.');
  }

  const [owner, repo] = repository.split('/');
  const ownerPagesRepo = `${owner.toLowerCase()}.github.io`;

  if (repo.toLowerCase() === ownerPagesRepo) {
    return `https://${repo}`;
  }

  return `https://${owner}.github.io/${repo}`;
};

export const loadHistoryEntries = async (historyPath) => {
  if (!existsSync(historyPath)) {
    return [];
  }

  const historyContent = (await readFile(historyPath, 'utf8')).trim();

  if (!historyContent) {
    return [];
  }

  return historyContent
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
};

export const saveHistoryEntries = async (historyPath, entries) => {
  await mkdir(path.dirname(historyPath), { recursive: true });

  const historyContent = entries.map((entry) => JSON.stringify(entry)).join('\n');
  await writeFile(historyPath, historyContent ? `${historyContent}\n` : '', 'utf8');
};

export const extractReportId = async (reportDir) => {
  const indexPath = path.join(reportDir, 'index.html');

  if (!existsSync(indexPath)) {
    return DEFAULT_REPORT_ID;
  }

  const indexContent = await readFile(indexPath, 'utf8');
  const match = REPORT_OPTIONS_PATTERN.exec(indexContent);

  if (!match) {
    return DEFAULT_REPORT_ID;
  }

  try {
    const reportOptions = JSON.parse(match[1]);
    return reportOptions.id || DEFAULT_REPORT_ID;
  } catch {
    return DEFAULT_REPORT_ID;
  }
};

const shouldCopyReportEntry = (sourceDir, currentPath) => {
  const relativePath = path.relative(sourceDir, currentPath);

  if (!relativePath) {
    return true;
  }

  const [topLevelEntry] = relativePath.split(path.sep);
  return topLevelEntry !== 'allure-history' && topLevelEntry !== 'runs';
};

export const writeReportAlias = async (reportDir, reportId) => {
  const aliasDir = path.join(reportDir, reportId);

  await mkdir(aliasDir, { recursive: true });
  await writeFile(
    path.join(aliasDir, 'index.html'),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Redirecting...</title>
    <script>
      const target = new URL("../", window.location.href);
      target.search = window.location.search;
      target.hash = window.location.hash;
      window.location.replace(target.toString());
    </script>
  </head>
  <body>
    <p><a href="../">Open report</a></p>
  </body>
</html>
`,
    'utf8',
  );
};

export const copyReportToArchive = async ({ sourceDir, destinationDir, reportId }) => {
  await rm(destinationDir, { recursive: true, force: true });
  await mkdir(destinationDir, { recursive: true });
  await cp(sourceDir, destinationDir, {
    recursive: true,
    filter: (currentPath) => shouldCopyReportEntry(sourceDir, currentPath),
  });
  await writeReportAlias(destinationDir, reportId);
};

export const rewriteHistoryUrls = ({ entries, baseUrl, runsDir }) =>
  entries.map((entry) => {
    const archiveIndexPath = path.join(runsDir, entry.uuid, 'index.html');

    if (!existsSync(archiveIndexPath)) {
      return entry;
    }

    return {
      ...entry,
      url: archiveUrlForRun(baseUrl, entry.uuid),
    };
  });

export const renderArchiveIndex = async ({ outputPath, entries }) => {
  const archivedEntries = entries.filter((entry) => entry.url).toReversed();
  const archiveItems = archivedEntries
    .map(
      (entry) => `<li>
          <a href="./${entry.uuid}/">${escapeHtml(entry.name || 'Allure report')}</a>
          <span>${escapeHtml(formatTimestamp(entry.timestamp))}</span>
        </li>`,
    )
    .join('\n');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Archived Allure Reports</title>
    <style>
      :root {
        color-scheme: light;
        --background: #f7f3ea;
        --panel: rgba(255, 252, 245, 0.94);
        --panel-border: rgba(37, 52, 63, 0.14);
        --text: #1f2a33;
        --muted: #55636f;
        --accent: #0f766e;
        --shadow: 0 20px 45px rgba(31, 42, 51, 0.12);
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
          radial-gradient(circle at top left, rgba(15, 118, 110, 0.12), transparent 24rem),
          linear-gradient(180deg, #faf7f0 0%, var(--background) 100%);
      }

      main {
        width: min(52rem, calc(100% - 2rem));
        margin: 0 auto;
        padding: 2.5rem 0 3.5rem;
      }

      h1 {
        margin: 0 0 0.75rem;
        font-size: clamp(2rem, 6vw, 3.5rem);
        line-height: 0.95;
        letter-spacing: -0.05em;
      }

      p {
        margin: 0;
        line-height: 1.6;
        color: var(--muted);
      }

      .panel {
        margin-top: 1.75rem;
        padding: 1.25rem;
        border: 1px solid var(--panel-border);
        border-radius: 1.25rem;
        background: var(--panel);
        box-shadow: var(--shadow);
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      li {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.85rem 0;
        border-top: 1px solid rgba(37, 52, 63, 0.1);
      }

      li:first-child {
        padding-top: 0;
        border-top: 0;
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

      .empty {
        color: var(--muted);
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Archived Allure reports.</h1>
      <p>Browse older E2E report snapshots that back the history links inside the latest report.</p>
      <section class="panel">
        ${
          archivedEntries.length
            ? `<ul>${archiveItems}</ul>`
            : '<p class="empty">No archived reports have been published yet.</p>'
        }
      </section>
    </main>
  </body>
</html>
`;

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, 'utf8');
};
