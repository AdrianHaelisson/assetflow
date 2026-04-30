import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Organizing locations...');

  const company = await prisma.company.findFirst();
  if (!company) {
    console.error('No company found.');
    return;
  }

  // Desired names
  const desiredNames = ['Home Office', 'Tobias Barreto', 'Aracaju'];

  // Ensure these 3 exist
  const finalLocations = [];
  for (const name of desiredNames) {
    // Try to find if an existing one matches partially
    let existing = await prisma.location.findFirst({
      where: { name: { contains: name }, companyId: company.id }
    });

    if (!existing) {
      existing = await prisma.location.create({
        data: { name, type: name === 'Home Office' ? 'OFFICE' : 'BRANCH', companyId: company.id }
      });
      console.log(`Created new location: ${name}`);
    } else {
      if (existing.name !== name) {
        existing = await prisma.location.update({
          where: { id: existing.id },
          data: { name }
        });
        console.log(`Renamed to: ${name}`);
      } else {
        console.log(`Location already correct: ${name}`);
      }
    }
    finalLocations.push(existing);
  }

  // Now, what about the other locations?
  const allLocations = await prisma.location.findMany({ where: { companyId: company.id } });
  
  const toDelete = allLocations.filter(loc => !desiredNames.includes(loc.name));

  if (toDelete.length > 0) {
    // We should move assets, users, departments to one of the remaining ones (e.g., Aracaju)
    const fallbackLocation = finalLocations.find(l => l.name === 'Aracaju')!;

    for (const loc of toDelete) {
      console.log(`Reassigning data from location to delete: ${loc.name} -> Aracaju`);
      
      await prisma.user.updateMany({
        where: { locationId: loc.id },
        data: { locationId: fallbackLocation.id }
      });

      await prisma.asset.updateMany({
        where: { locationId: loc.id },
        data: { locationId: fallbackLocation.id }
      });

      await prisma.department.updateMany({
        where: { locationId: loc.id },
        data: { locationId: fallbackLocation.id }
      });
      
      // Finally delete the location
      await prisma.location.delete({
        where: { id: loc.id }
      });
      console.log(`Deleted location: ${loc.name}`);
    }
  }

  console.log('Locations successfully organized!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
