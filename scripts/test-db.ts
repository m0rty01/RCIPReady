import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('Testing database connection...');
    console.log('Environment:', {
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      DIRECT_URL: process.env.DIRECT_URL ? 'Set' : 'Not set',
    });

    await prisma.$connect();
    console.log('Successfully connected to database');

    const result = await prisma.$queryRaw`SELECT current_database(), current_schema()`;
    console.log('Database info:', result);

    const communities = await prisma.community.findMany();
    console.log(`Found ${communities.length} communities`);

  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
