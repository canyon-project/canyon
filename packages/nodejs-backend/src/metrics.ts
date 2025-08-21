import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

export const registry = new Registry();

collectDefaultMetrics({ register: registry });

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed, labeled by method, path, and status code.',
  labelNames: ['method', 'path', 'status'] as const,
  registers: [registry]
});

export const httpRequestDurationSeconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency in seconds, labeled by method, path, and status code.',
  labelNames: ['method', 'path', 'status'] as const,
  registers: [registry]
});


