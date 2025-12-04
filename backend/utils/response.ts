import { Response } from 'express';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: PaginationMeta;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Send success response
 */
export function sendSuccess<T>(
  res: Response,
  message: string,
  data?: T,
  meta?: PaginationMeta,
  statusCode: number = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };
  return res.status(statusCode).json(response);
}

/**
 * Send error response
 */
export function sendError(
  res: Response,
  message: string,
  error?: string,
  statusCode: number = 400
): Response {
  const response: ApiResponse = {
    success: false,
    message,
    error,
  };
  return res.status(statusCode).json(response);
}
