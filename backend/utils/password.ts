import bcrypt from 'bcryptjs';

/**
 * Hash password menggunakan bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify password dengan hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns Boolean apakah password cocok
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
