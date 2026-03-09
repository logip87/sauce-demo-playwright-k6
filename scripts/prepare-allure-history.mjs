import { existsSync } from 'node:fs';
import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  copyReportToArchive,
  extractReportId,
  getPagesBaseUrl,
  loadHistoryEntries,
  rewriteHistoryUrls,
  saveHistoryEntries,
} from './allure-history-utils.mjs';

const getArg = (flag) => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const pagesDir = path.resolve(process.cwd(), getArg('--pages-dir') ?? '.gh-pages');
const archiveDir = path.resolve(process.cwd(), getArg('--archive-dir') ?? '.allure-pages-state');
const historyPath = path.resolve(
  process.cwd(),
  getArg('--history-path') ?? 'e2e/artifacts/allure-history/history.jsonl',
);
const repository = getArg('--repository') ?? process.env.GITHUB_REPOSITORY;

const pagesHistoryPath = path.join(pagesDir, 'e2e', 'allure-history', 'history.jsonl');
const pagesReportDir = path.join(pagesDir, 'e2e');
const pagesRunsDir = path.join(pagesDir, 'e2e', 'runs');
const archiveRunsDir = path.join(archiveDir, 'e2e', 'runs');

await rm(archiveRunsDir, { recursive: true, force: true });
await mkdir(path.dirname(archiveRunsDir), { recursive: true });

if (existsSync(pagesRunsDir)) {
  await cp(pagesRunsDir, archiveRunsDir, { recursive: true });
} else {
  await mkdir(archiveRunsDir, { recursive: true });
}

const restoredEntries = await loadHistoryEntries(pagesHistoryPath);
const latestArchivedEntry = restoredEntries.at(-1);

if (latestArchivedEntry && existsSync(path.join(pagesReportDir, 'index.html'))) {
  const latestArchiveDir = path.join(archiveRunsDir, latestArchivedEntry.uuid);

  if (!existsSync(path.join(latestArchiveDir, 'index.html'))) {
    const reportId = await extractReportId(pagesReportDir);
    await copyReportToArchive({
      sourceDir: pagesReportDir,
      destinationDir: latestArchiveDir,
      reportId,
    });
  }
}

if (!restoredEntries.length) {
  await saveHistoryEntries(historyPath, []);
  process.exit(0);
}

const baseUrl = await getPagesBaseUrl({ pagesDir, repository });
const linkedEntries = rewriteHistoryUrls({
  entries: restoredEntries,
  baseUrl,
  runsDir: archiveRunsDir,
});

await saveHistoryEntries(historyPath, linkedEntries);
