import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const hash = await Bun.password.hash('assetflow@2025', { algorithm: 'bcrypt', cost: 10 });
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN', companyId: 'comp1' } });
  if (!admin) { console.log('Admin não encontrado'); return; }
  const updated = await prisma.user.update({
    where: { id: admin.id },
    data: { name: 'Administrador', email: 'admin@assetflow.com', passwordHash: hash }
  });
  console.log('✅ Admin atualizado:', updated.name, updated.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
