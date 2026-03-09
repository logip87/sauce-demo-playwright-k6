import { existsSync } from 'node:fs';
import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  copyReportToArchive,
  extractReportId,
  getPagesBaseUrl,
  loadHistoryEntries,
  renderArchiveIndex,
  rewriteHistoryUrls,
  saveHistoryEntries,
  writeReportAlias,
} from './allure-history-utils.mjs';

const getArg = (flag) => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const siteDir = path.resolve(process.cwd(), getArg('--site-dir') ?? 'site');
const pagesDir = path.resolve(process.cwd(), getArg('--pages-dir') ?? '.gh-pages');
const archiveDir = path.resolve(process.cwd(), getArg('--archive-dir') ?? '.allure-pages-state');
const reportDir = path.resolve(process.cwd(), getArg('--report-dir') ?? 'e2e/artifacts/allure-report');
const historyPath = path.resolve(
  process.cwd(),
  getArg('--history-path') ?? 'e2e/artifacts/allure-history/history.jsonl',
);
const repository = getArg('--repository') ?? process.env.GITHUB_REPOSITORY;

const siteE2eDir = path.join(siteDir, 'e2e');
const siteRunsDir = path.join(siteE2eDir, 'runs');
const archiveRunsDir = path.join(archiveDir, 'e2e', 'runs');
const siteHistoryPath = path.join(siteE2eDir, 'allure-history', 'history.jsonl');
const historyEntries = await loadHistoryEntries(historyPath);
const currentEntry = historyEntries.at(-1);

if (!currentEntry) {
  throw new Error(`No Allure history entries were found at ${historyPath}.`);
}

await rm(siteE2eDir, { recursive: true, force: true });
await mkdir(siteDir, { recursive: true });
await cp(reportDir, siteE2eDir, { recursive: true });

const currentReportId = await extractReportId(reportDir);
await writeReportAlias(siteE2eDir, currentReportId);

if (existsSync(archiveRunsDir)) {
  await cp(archiveRunsDir, siteRunsDir, { recursive: true });
}

await copyReportToArchive({
  sourceDir: reportDir,
  destinationDir: path.join(siteRunsDir, currentEntry.uuid),
  reportId: currentReportId,
});

const baseUrl = await getPagesBaseUrl({ pagesDir, repository });
const linkedEntries = rewriteHistoryUrls({
  entries: historyEntries,
  baseUrl,
  runsDir: siteRunsDir,
});

await saveHistoryEntries(historyPath, linkedEntries);
await saveHistoryEntries(siteHistoryPath, linkedEntries);
await renderArchiveIndex({
  outputPath: path.join(siteRunsDir, 'index.html'),
  entries: linkedEntries,
});

if (existsSync(path.join(pagesDir, 'CNAME'))) {
  await cp(path.join(pagesDir, 'CNAME'), path.join(siteDir, 'CNAME'));
}
