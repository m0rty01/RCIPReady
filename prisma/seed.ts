import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const communities = [
    {
      id: '1',
      name: 'Thunder Bay',
      province: 'Ontario',
      population: 108843,
      website: 'https://www.thunderbay.ca/en/immigration.aspx',
    },
    {
      id: '2',
      name: 'North Bay',
      province: 'Ontario',
      population: 51553,
      website: 'https://www.northbay.ca/immigration/',
    },
    // Add more communities as needed
  ];

  const employers = [
    {
      id: '1',
      name: 'Thunder Bay Regional Health Sciences Centre',
      website: 'https://tbrhsc.net/careers/',
      communityId: '1',
    },
    {
      id: '2',
      name: 'North Bay Regional Health Centre',
      website: 'https://www.nbrhc.on.ca/careers/',
      communityId: '2',
    },
    // Add more employers as needed
  ];

  console.log('Start seeding...');

  for (const community of communities) {
    await prisma.community.upsert({
      where: { id: community.id },
      update: community,
      create: community,
    });
  }

  for (const employer of employers) {
    await prisma.employer.upsert({
      where: { id: employer.id },
      update: employer,
      create: employer,
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });