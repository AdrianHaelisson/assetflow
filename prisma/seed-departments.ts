import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding requested departments...');

  const company = await prisma.company.findFirst();
  if (!company) {
    console.error('No company found. Please run main seed first.');
    return;
  }

  const departmentsToCreate = [
    'Fiscal',
    'Contábil',
    'DP',
    'Processos',
    'Comercial',
    'Financeiro',
    'Paralegal'
  ];

  for (const depName of departmentsToCreate) {
    const existing = await prisma.department.findFirst({
      where: { name: depName, companyId: company.id }
    });

    if (!existing) {
      await prisma.department.create({
        data: {
          name: depName,
          companyId: company.id,
        }
      });
      console.log(`✅ Created department: ${depName}`);
    } else {
      console.log(`ℹ️ Department already exists: ${depName}`);
    }
  }

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
