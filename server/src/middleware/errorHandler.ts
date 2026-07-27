import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { error } from '../utils/apiResponse';
import { env } from '../config/env';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Operational errors (known, expected)
  if (err instanceof AppError) {
    res.status(err.statusCode).json(error(err.message));
    return;
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    res.status(422).json(error('Validation failed', err.errors));
    console.warn('ZodError:', message);
    return;
  }

  // Prisma unique constraint violation
  if ((err as { code?: string }).code === 'P2002') {
    res.status(409).json(error('A record with this value already exists'));
    return;
  }

  // Prisma record not found
  if ((err as { code?: string }).code === 'P2025') {
    res.status(404).json(error('Record not found'));
    return;
  }

  // Unknown errors — don't leak internals in production
  console.error('Unhandled error:', err);
  res.status(500).json(
    error(
      env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      env.NODE_ENV === 'development' ? err.stack : undefined,
    ),
  );
}
