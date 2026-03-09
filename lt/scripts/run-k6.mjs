import { mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const artifactDir = path.join(projectRoot, 'artifacts', 'k6');
const scriptPath = path.join(projectRoot, 'tests', 'reqres-users.test.ts');
const targetUrl = process.env.K6_TARGET_URL ?? 'https://reqres.in/api/users?page=1';
const requiresReqresApiKey = /^https:\/\/reqres\.in\/api\//u.test(targetUrl);

const importSpecifierPatterns = [
  /(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/gu,
  /import\(\s*['"]([^'"]+)['"]\s*\)/gu,
];

const collectTypeScriptFiles = (directoryPath) => {
  const entries = readdirSync(directoryPath, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      return collectTypeScriptFiles(fullPath);
    }

    return fullPath.endsWith('.ts') ? [fullPath] : [];
  });
};

const findInvalidRelativeImports = (filePath) => {
  const fileContent = readFileSync(filePath, 'utf8');
  const issues = [];

  for (const pattern of importSpecifierPatterns) {
    for (const match of fileContent.matchAll(pattern)) {
      const specifier = match[1];

      if (specifier === undefined) {
        continue;
      }

      const isRelativeImport = specifier.startsWith('./') || specifier.startsWith('../');
      const hasExplicitExtension = /\.[cm]?[jt]s$/u.test(specifier) || specifier.endsWith('.json');

      if (!isRelativeImport || hasExplicitExtension) {
        continue;
      }

      const matchOffset = match.index ?? 0;
      const lineNumber = fileContent.slice(0, matchOffset).split('\n').length;
      issues.push({
        filePath,
        lineNumber,
        specifier,
      });
    }
  }

  return issues;
};

const validateK6LocalImports = () => {
  const filesToCheck = ['src', 'tests'].flatMap((directoryName) =>
    collectTypeScriptFiles(path.join(projectRoot, directoryName)),
  );
  const invalidImports = filesToCheck.flatMap(findInvalidRelativeImports);

  if (invalidImports.length === 0) {
    return;
  }

  console.error('k6 requires fully specified relative imports for local modules.');

  for (const issue of invalidImports) {
    const relativeFilePath = path.relative(projectRoot, issue.filePath).replaceAll('\\', '/');
    console.error(`- ${relativeFilePath}:${issue.lineNumber} uses "${issue.specifier}"`);
  }

  console.error('Use explicit filenames such as "../src/report.ts" so k6 can resolve the module.');
  process.exit(1);
};

validateK6LocalImports();

mkdirSync(artifactDir, { recursive: true });

if (requiresReqresApiKey && !process.env.REQRES_API_KEY) {
  console.error('REQRES_API_KEY is required for load tests against ReqRes API endpoints.');
  console.error('Set REQRES_API_KEY locally and add the same secret in GitHub Actions before running this scenario.');
  process.exit(1);
}

const commandArgs = ['run', scriptPath];

const result = spawnSync('k6', commandArgs, {
  cwd: projectRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    K6_WEB_DASHBOARD: process.env.K6_WEB_DASHBOARD ?? 'true',
    K6_WEB_DASHBOARD_EXPORT:
      process.env.K6_WEB_DASHBOARD_EXPORT ?? path.join(artifactDir, 'dashboard.html'),
    K6_WEB_DASHBOARD_PORT: process.env.K6_WEB_DASHBOARD_PORT ?? '-1',
  },
});

if (result.error) {
  console.error('Unable to launch k6. Install k6 locally or use the GitHub Actions pipeline.');
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
