# Performance Report

## Test Setup

- Target URL: https://reqres.in/api/users?page=1
- Scenario: 100 constant virtual users, each looping one request followed by a 1 second think time
- Intended throughput: about 100 requests/second
- Test duration: 2m
- Tooling: k6 with TypeScript source and built-in web dashboard export

## Captured Metrics

| Metric | Value |
| --- | --- |
| P50 | 8.75 ms |
| P95 | 120.20 ms |
| P99 | 424.19 ms |
| Error rate | 100.00% |
| Throughput | 95.87 req/s |

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
