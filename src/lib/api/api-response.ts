import { NextResponse } from 'next/server';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
  timestamp: string;
}

export interface ApiPaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
  timestamp: string;
}

export class AppError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: unknown;

  constructor(message: string, statusCode: number = 500, code?: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ApiResponse {
  static success<T>(data: T, message?: string, status: number = 200) {
    const payload: ApiSuccessResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(payload, { status });
  }

  static error(error: unknown, defaultStatus: number = 500) {
    let message = 'An unexpected error occurred';
    let statusCode = defaultStatus;
    let code: string | undefined = undefined;
    let details: unknown = undefined;

    if (error instanceof AppError) {
      message = error.message;
      statusCode = error.statusCode;
      code = error.code;
      details = error.details;
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    const payload: ApiErrorResponse = {
      success: false,
      error: message,
      code,
      details,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(payload, { status: statusCode });
  }

  static paginate<T>(items: T[], total: number, page: number, limit: number, status: number = 200) {
    const totalPages = Math.ceil(total / limit);
    const payload: ApiPaginatedResponse<T> = {
      success: true,
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(payload, { status });
  }
}
