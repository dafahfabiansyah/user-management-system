import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';

// Extend Express Request interface untuk include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
      };
    }
  }
}

/**
 * Middleware untuk memverifikasi access token
 * Akan menambahkan user data ke req.user jika token valid
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Ambil token dari Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Token tidak ditemukan', 'Authorization token required', 401);
    }

    // Extract token dari "Bearer <token>"
    const token = authHeader.substring(7);

    // Verify token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return sendError(res, 'Token tidak valid atau sudah expired', 'Invalid or expired token', 401);
    }

    // Attach user data ke request
    req.user = decoded;

    next();
  } catch (error: any) {
    console.error('Authentication error:', error);
    return sendError(res, 'Authentication failed', error.message, 401);
  }
}
