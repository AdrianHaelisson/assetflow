import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Distributing assets and users across locations and departments...');

  const company = await prisma.company.findFirst();
  if (!company) return;

  const locations = await prisma.location.findMany({ where: { companyId: company.id } });
  const departments = await prisma.department.findMany({ where: { companyId: company.id } });

  if (locations.length === 0 || departments.length === 0) {
    console.log('No locations or departments found. Aborting.');
    return;
  }

  const users = await prisma.user.findMany({ where: { companyId: company.id } });
  const assets = await prisma.asset.findMany({ where: { companyId: company.id } });

  console.log(`Found ${users.length} users and ${assets.length} assets to distribute.`);

  for (const user of users) {
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomDepartment = departments[Math.floor(Math.random() * departments.length)];

    await prisma.user.update({
      where: { id: user.id },
      data: {
        locationId: randomLocation.id,
        departmentId: randomDepartment.id
      }
    });
  }

  for (const asset of assets) {
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomDepartment = departments[Math.floor(Math.random() * departments.length)];

    await prisma.asset.update({
      where: { id: asset.id },
      data: {
        locationId: randomLocation.id,
        departmentId: randomDepartment.id
      }
    });
  }

  console.log('✅ Distribution complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
