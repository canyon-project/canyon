import type { NextFunction, Request, Response } from 'express';
import { httpRequestDurationSeconds, httpRequestsTotal } from '../metrics';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1e9;
    const status = String(res.statusCode);
    const method = req.method;
    const path = (req.route?.path as string) || req.path;
    httpRequestsTotal.labels(method, path, status).inc();
    httpRequestDurationSeconds.labels(method, path, status).observe(duration);
  });
  next();
}


