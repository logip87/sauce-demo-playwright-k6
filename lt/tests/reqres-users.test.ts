import http from 'k6/http';
import exec from 'k6/execution';
import { check, sleep } from 'k6';
import type { Options } from 'k6/options';

import { createSummaryOutputs } from '../src/report.ts';

const vus = Number(__ENV['K6_VUS'] ?? 100);
const duration = __ENV['K6_DURATION'] ?? '2m';
const targetUrl = __ENV['K6_TARGET_URL'] ?? 'https://reqres.in/api/users?page=1';
const targetRps = Number(__ENV['K6_TARGET_RPS'] ?? 100);
const apiKey = __ENV['REQRES_API_KEY'];
const unexpectedResponseLogLimit = Number(__ENV['K6_UNEXPECTED_RESPONSE_LOG_LIMIT'] ?? 3);
let hasLoggedUnexpectedResponse = false;

export const options: Options = {
  scenarios: {
    steady_state_users: {
      executor: 'constant-vus',
      vus,
      duration,
      gracefulStop: '0s',
      tags: {
        test_type: 'steady-state',
      },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<1500'],
    http_req_failed: ['rate<0.01'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'p(50)', 'p(95)', 'p(99)', 'max'],
};

export default function (): void {
  const response = http.get(targetUrl, {
    headers: {
      ...(apiKey ? { 'x-api-key': apiKey } : {}),
      'user-agent': 'techlt-qa-assessment-k6/1.0',
    },
    tags: {
      endpoint: 'users-page-1',
    },
  });

  if (response.status !== 200 && !hasLoggedUnexpectedResponse && exec.vu.idInTest <= unexpectedResponseLogLimit) {
    hasLoggedUnexpectedResponse = true;

    const bodyPreview =
      typeof response.body === 'string' ? response.body.replace(/\s+/gu, ' ').slice(0, 240) : '';

    console.error(
      JSON.stringify({
        type: 'unexpected_response_sample',
        vu: exec.vu.idInTest,
        iteration: exec.scenario.iterationInTest,
        status: response.status,
        url: response.url,
        hasApiKey: Boolean(apiKey),
        contentType: response.headers['Content-Type'] ?? response.headers['content-type'] ?? 'unknown',
        bodyPreview,
      }),
    );
  }

  check(response, {
    'status is 200': (res) => res.status === 200,
    'body is not empty': (res) => Boolean(res.body),
  });

  sleep(1);
}

export function handleSummary(data: Parameters<typeof createSummaryOutputs>[0]): Record<string, string> {
  return createSummaryOutputs(data, {
    duration,
    expectedRequestsPerSecond: targetRps,
    targetUrl,
    vus,
  });
}
