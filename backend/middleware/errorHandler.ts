import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode = 500, message } = error;

  // Log error for debugging
  console.error('🚨 API Error:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    statusCode,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validierungsfehler: ' + message;
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Ungültige ID-Format';
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = 'Datensatz bereits vorhanden';
  }

  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Ungültiger Token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token abgelaufen';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: message || 'Interner Serverfehler',
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method
    },
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Custom error class
export class AppError extends Error implements ApiError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 