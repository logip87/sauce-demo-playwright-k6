interface SummaryMetric {
  values: Record<string, number>;
}

interface K6SummaryData {
  metrics: Record<string, SummaryMetric>;
}

interface ReportContext {
  duration: string;
  expectedRequestsPerSecond: number;
  targetUrl: string;
  vus: number;
}

const readMetric = (
  metrics: Record<string, SummaryMetric>,
  metricName: string,
  statistic: string,
): number => metrics[metricName]?.values[statistic] ?? 0;

const formatMilliseconds = (value: number): string => `${value.toFixed(2)} ms`;
const formatRate = (value: number): string => `${(value * 100).toFixed(2)}%`;
const formatRps = (value: number): string => value.toFixed(2);

export const createPerformanceReport = (
  data: K6SummaryData,
  context: ReportContext,
): string => {
  const durationMetrics = data.metrics['http_req_duration']?.values ?? {};
  const errorRate = readMetric(data.metrics, 'http_req_failed', 'rate');
  const throughput = readMetric(data.metrics, 'http_reqs', 'rate');

  return `# Performance Report

## Test Setup

- Target URL: ${context.targetUrl}
- Scenario: ${context.vus} constant virtual users, each looping one request followed by a 1 second think time
- Intended throughput: about ${context.expectedRequestsPerSecond} requests/second
- Test duration: ${context.duration}
- Tooling: k6 with TypeScript source and built-in web dashboard export

## Captured Metrics

| Metric | Value |
| --- | --- |
| P50 | ${formatMilliseconds(durationMetrics['p(50)'] ?? 0)} |
| P95 | ${formatMilliseconds(durationMetrics['p(95)'] ?? 0)} |
| P99 | ${formatMilliseconds(durationMetrics['p(99)'] ?? 0)} |
| Error rate | ${formatRate(errorRate)} |
| Throughput | ${formatRps(throughput)} req/s |

## Interpretation

The scenario is designed to hold a steady 100-user load long enough to smooth out startup noise without being excessive for a public sample API. Two minutes yields roughly twelve thousand requests in the steady state, which is usually enough to make the percentile spread meaningful.

Use the percentile spread to judge consistency:

- a tight P50 to P95 gap suggests stable handling under constant concurrency
- a widening P95 to P99 gap suggests tail latency or occasional slow dependencies
- any sustained non-zero error rate should be investigated before tightening thresholds further

## Potential Optimizations

- Cache or precompute repeated response payloads if this endpoint is fronted by a shared service.
- Add upstream timeout and retry telemetry so tail latency is attributable.
- Track saturation signals such as CPU, memory, and downstream wait time alongside k6 metrics.
- If the endpoint becomes business critical, add service-level objectives for P95 and error rate.
`;
};

export const createSummaryOutputs = (
  data: K6SummaryData,
  context: ReportContext,
): Record<string, string> => ({
  'artifacts/k6/summary.json': JSON.stringify(data, null, 2),
  'artifacts/k6/performance-report.md': createPerformanceReport(data, context),
  stdout: `Performance report written to artifacts/k6/performance-report.md\n`,
});
