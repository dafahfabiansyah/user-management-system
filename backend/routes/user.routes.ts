import { Router, Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * GET /api/users
 * Get all users with search, sort, and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search = '',
      sortBy = 'createdAt',
      order = 'desc',
      page = '1',
      limit = '10',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' as any } },
            { email: { contains: search as string, mode: 'insensitive' as any } },
          ],
        }
      : {};

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Get users with pagination and sorting
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        [sortBy as string]: order as 'asc' | 'desc',
      },
      skip,
      take: limitNum,
    });

    const totalPages = Math.ceil(total / limitNum);

    return sendSuccess(
      res,
      'Users retrieved successfully',
      users,
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      }
    );
  } catch (error: any) {
    console.error('Get users error:', error);
    return sendError(res, 'Failed to retrieve users', error.message, 500);
  }
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 'User not found', 404);
    }

    return sendSuccess(res, 'User retrieved successfully', user);
  } catch (error: any) {
    console.error('Get user error:', error);
    return sendError(res, 'Failed to retrieve user', error.message, 500);
  }
});

export default router;
