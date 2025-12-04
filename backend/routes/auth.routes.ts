import { Router, Request, Response } from 'express';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, getRefreshTokenExpiry } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * POST /api/auth/register
 * Register user baru
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Validasi input dengan Zod
    const validatedData = registerSchema.parse(req.body);

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return sendError(res, 'Email sudah terdaftar', 'Email already exists', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });
    const refreshToken = generateRefreshToken();

    // Simpan refresh token ke database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return sendSuccess(
      res,
      'Registrasi berhasil',
      {
        user,
        accessToken,
        refreshToken,
      },
      undefined,
      201
    );
  } catch (error: any) {
    // Handling Zod validation errors
    if (error.name === 'ZodError') {
      return sendError(
        res,
        'Validasi gagal',
        error.errors.map((e: any) => e.message).join(', '),
        400
      );
    }

    console.error('Register error:', error);
    return sendError(res, 'Terjadi kesalahan saat registrasi', error.message, 500);
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validasi input
    const validatedData = loginSchema.parse(req.body);

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return sendError(res, 'Email atau password salah', 'Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(validatedData.password, user.password);

    if (!isPasswordValid) {
      return sendError(res, 'Email atau password salah', 'Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });
    const refreshToken = generateRefreshToken();

    // Simpan refresh token ke database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return sendSuccess(res, 'Login berhasil', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    // Handling Zod validation errors
    if (error.name === 'ZodError') {
      return sendError(
        res,
        'Validasi gagal',
        error.errors.map((e: any) => e.message).join(', '),
        400
      );
    }

    console.error('Login error:', error);
    return sendError(res, 'Terjadi kesalahan saat login', error.message, 500);
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token menggunakan refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 'Refresh token harus disertakan', 'Refresh token required', 400);
    }

    // Cari refresh token di database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      return sendError(res, 'Refresh token tidak valid', 'Invalid refresh token', 401);
    }

    // Cek apakah token sudah expired
    if (new Date() > storedToken.expiresAt) {
      // Hapus token yang expired
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      return sendError(res, 'Refresh token sudah expired', 'Refresh token expired', 401);
    }

    // Generate access token baru
    const newAccessToken = generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
    });

    return sendSuccess(res, 'Access token berhasil di-refresh', {
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    return sendError(res, 'Terjadi kesalahan saat refresh token', error.message, 500);
  }
});

/**
 * POST /api/auth/logout
 * Logout user dengan menghapus refresh token dari database
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 'Refresh token harus disertakan', 'Refresh token required', 400);
    }

    // Hapus refresh token dari database
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    return sendSuccess(res, 'Logout berhasil', null);
  } catch (error: any) {
    console.error('Logout error:', error);
    return sendError(res, 'Terjadi kesalahan saat logout', error.message, 500);
  }
});

export default router;
