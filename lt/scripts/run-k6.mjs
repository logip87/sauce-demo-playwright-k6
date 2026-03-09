import { mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const artifactDir = path.join(projectRoot, 'artifacts', 'k6');
const scriptPath = path.join(projectRoot, 'tests', 'reqres-users.test.ts');
const useGrafanaCloud = process.argv.includes('--grafana') || Boolean(process.env.K6_CLOUD_TOKEN);

mkdirSync(artifactDir, { recursive: true });

const commandArgs = useGrafanaCloud
  ? ['cloud', 'run', '--local-execution', scriptPath]
  : ['run', scriptPath];

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