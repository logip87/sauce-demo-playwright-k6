# Performance Report

## Test Setup

- Target URL: https://reqres.in/api/users?page=1
- Scenario: constant arrival rate targeting 100 requests/second
- VU pool: 100 pre-allocated VUs, scaling up to 200 if the target rate needs it
- Test duration: 2m
- Tooling: k6 with TypeScript source
- Assumptions: one authenticated GET request per iteration, no client-side think time, ReqRes public API used manually by design

## Captured Metrics

| Metric | Value |
| --- | --- |
| P50 | 6.96 ms |
| P95 | 98.16 ms |
| P99 | 148.53 ms |
| Error rate | 100.00% |
| Throughput | 99.99 req/s |
| Dropped iterations | 0 |

## Interpretation

This scenario is rate-driven rather than concurrency-driven. k6 adds VUs as needed to keep the configured request pace, which makes the achieved throughput and dropped iteration count more useful than a raw VU number when reading the result.

Use the results to judge both latency stability and rate sustainability:

- a tight P50 to P95 gap suggests stable handling at the requested arrival rate
- if throughput falls noticeably below 100 req/s, the endpoint or VU pool is struggling to keep up
- dropped iterations mean k6 could not start work fast enough to maintain the configured pace
- any sustained non-zero error rate should be investigated before tightening thresholds further

## Potential Optimizations

- Cache or precompute repeated response payloads if this endpoint is fronted by a shared service.
- Add upstream timeout and retry telemetry so tail latency is attributable.
- Track saturation signals such as CPU, memory, and downstream wait time alongside k6 metrics.
- If the endpoint becomes business critical, add service-level objectives for both sustained rate and tail latency.
