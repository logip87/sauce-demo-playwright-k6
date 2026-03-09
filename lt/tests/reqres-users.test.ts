import http from 'k6/http';
import exec from 'k6/execution';
import { check } from 'k6';
import type { Options } from 'k6/options';

import { createSummaryOutputs } from '../src/report.ts';

const duration = '2m';
const targetRate = 100;
const targetUrl = 'https://reqres.in/api/users?page=1';
const apiKey = __ENV['REQRES_API_KEY'] ?? '';
const unexpectedResponseLogLimit = 3;
let hasLoggedUnexpectedResponse = false;
const preAllocatedVUs = 100;
const maxVUs = 200;

if (!apiKey) {
  throw new Error('REQRES_API_KEY is required for the ReqRes load test.');
}

export const options: Options = {
  scenarios: {
    reqres_users_page: {
      executor: 'constant-arrival-rate',
      rate: targetRate,
      timeUnit: '1s',
      duration,
      preAllocatedVUs,
      maxVUs,
      gracefulStop: '0s',
      tags: {
        test_type: 'constant-arrival-rate',
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
      'x-api-key': apiKey,
      'user-agent': 'techlt-qa-assessment-k6/1.0',
    },
    tags: {
      endpoint: 'users-page-1',
    },
  });

  const bodyPreview =
    typeof response.body === 'string' ? response.body.replace(/\s+/gu, ' ').slice(0, 240) : '';

  console.log(
    JSON.stringify({
      type: 'response_sample',
      vu: exec.vu.idInTest,
      iteration: exec.scenario.iterationInTest,
      status: response.status,
      url: response.url,
      contentType: response.headers['Content-Type'] ?? response.headers['content-type'] ?? 'unknown',
      bodyPreview,
    }),
  );

  if (response.status !== 200 && !hasLoggedUnexpectedResponse && exec.vu.idInTest <= unexpectedResponseLogLimit) {
    hasLoggedUnexpectedResponse = true;

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
}

export function handleSummary(data: Parameters<typeof createSummaryOutputs>[0]): Record<string, string> {
  return createSummaryOutputs(data, {
    duration,
    maxVUs,
    preAllocatedVUs,
    targetRate,
    targetUrl,
  });
}
