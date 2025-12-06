import { prisma } from '../lib/prisma';
import { hashPassword } from '../utils/password';

async function main() {
  // Hash password untuk semua user
  const hashedPassword = await hashPassword('password123');

  const jane = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      name: 'Jane Doe',
      role: 'admin',
      password: hashedPassword,
      createdAt: new Date(),
    },
  })
  const john = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      name: 'John Doe',
      role: 'staff',
      password: hashedPassword,
      createdAt: new Date(),
    },
  })
  
  console.log({ jane, john });
 
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })