import { z } from 'zod';

/**
 * Schema untuk register
 */
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  
  email: z.string()
    .email('Format email tidak valid')
    .toLowerCase(),
  
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Za-z]/, 'Password harus mengandung huruf')
    .regex(/[0-9]/, 'Password harus mengandung angka'),
});

/**
 * Schema untuk login
 */
export const loginSchema = z.object({
  email: z.string()
    .email('Format email tidak valid')
    .toLowerCase(),
  
  password: z.string()
    .min(1, 'Password harus diisi'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
