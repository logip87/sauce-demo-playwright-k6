interface SummaryMetric {
  values: Record<string, number>;
}

interface K6SummaryData {
  metrics: Record<string, SummaryMetric>;
}

interface ReportContext {
  duration: string;
  maxVUs: number;
  preAllocatedVUs: number;
  targetRate: number;
  targetUrl: string;
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
  const droppedIterations = readMetric(data.metrics, 'dropped_iterations', 'count');
  const throughput = readMetric(data.metrics, 'http_reqs', 'rate');

  return `# Performance Report

## Test Setup

- Target URL: ${context.targetUrl}
- Scenario: constant arrival rate targeting ${context.targetRate} requests/second
- VU pool: ${context.preAllocatedVUs} pre-allocated VUs, scaling up to ${context.maxVUs} if the target rate needs it
- Test duration: ${context.duration}
- Tooling: k6 with TypeScript source
- Assumptions: one authenticated GET request per iteration, no client-side think time, ReqRes public API used manually by design

## Captured Metrics

| Metric | Value |
| --- | --- |
| P50 | ${formatMilliseconds(durationMetrics['p(50)'] ?? 0)} |
| P95 | ${formatMilliseconds(durationMetrics['p(95)'] ?? 0)} |
| P99 | ${formatMilliseconds(durationMetrics['p(99)'] ?? 0)} |
| Error rate | ${formatRate(errorRate)} |
| Throughput | ${formatRps(throughput)} req/s |
| Dropped iterations | ${droppedIterations.toFixed(0)} |

## Interpretation

This scenario is rate-driven rather than concurrency-driven. k6 adds VUs as needed to keep the configured request pace, which makes the achieved throughput and dropped iteration count more useful than a raw VU number when reading the result.

Use the results to judge both latency stability and rate sustainability:

- a tight P50 to P95 gap suggests stable handling at the requested arrival rate
- if throughput falls noticeably below ${context.targetRate} req/s, the endpoint or VU pool is struggling to keep up
- dropped iterations mean k6 could not start work fast enough to maintain the configured pace
- any sustained non-zero error rate should be investigated before tightening thresholds further

## Potential Optimizations

- Cache or precompute repeated response payloads if this endpoint is fronted by a shared service.
- Add upstream timeout and retry telemetry so tail latency is attributable.
- Track saturation signals such as CPU, memory, and downstream wait time alongside k6 metrics.
- If the endpoint becomes business critical, add service-level objectives for both sustained rate and tail latency.
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
