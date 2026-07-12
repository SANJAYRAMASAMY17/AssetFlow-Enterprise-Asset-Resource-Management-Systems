import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.ts';
import { logger } from '../utils/logger.ts';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack, path: req.path, method: req.method });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors
    });
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: err.issues
    });
  }

  // Prisma errors
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      success: false,
      message: 'Database Error',
      errors: err.meta
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    errors: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
