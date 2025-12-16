import { PrismaClient } from '@/generated/prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  // Use PRISMA_DATABASE_URL (Accelerate URL) for app queries
  const url = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error('PRISMA_DATABASE_URL environment variable is not set');
  }
  return new PrismaClient({
    accelerateUrl: url,
  }).$extends(withAccelerate());
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
