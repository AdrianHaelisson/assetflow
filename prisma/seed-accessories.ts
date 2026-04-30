import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const HARDWARE_MODELS = [
  'Dell Latitude 5420', 'MacBook Pro 14"', 'Lenovo ThinkPad T14', 'HP EliteBook 840',
  'Dell XPS 13', 'MacBook Air M2', 'ThinkCentre M720q', 'iMac 24"'
];

const ACCESSORY_MODELS = [
  'Mouse Logitech MX Master 3S', 'Teclado Mecânico Keychron K2', 'Monitor Dell UltraSharp 27"',
  'Headset Jabra Evolve2 65', 'Dock Station Dell WD19', 'Monitor LG Ultrawide 34"',
  'Mouse Apple Magic Mouse 2', 'Teclado Apple Magic Keyboard'
];

const SOFTWARE_MODELS = [
  'Licença Office 365 E3', 'Adobe Creative Cloud', 'JetBrains All Products',
  'Figma Professional', 'Github Copilot Enterprise'
];

async function main() {
  console.log('Iniciando geração de 100 novos ativos/acessórios...');

  const companyId = 'comp1';

  // Buscar usuários e localizações existentes
  const users = await prisma.user.findMany({ where: { companyId } });
  const locations = await prisma.location.findMany({ where: { companyId } });
  const departments = await prisma.department.findMany({ where: { companyId } });

  if (users.length === 0 || locations.length === 0) {
    console.error('Erro: Nenhum usuário ou sede encontrada. Rode o seed inicial primeiro.');
    return;
  }

  const assetsToCreate = [];
  const assignmentsToCreate = [];

  for (let i = 0; i < 100; i++) {
    const r = Math.random();
    let type = 'HARDWARE';
    let model = '';
    
    if (r < 0.4) {
      type = 'HARDWARE';
      model = HARDWARE_MODELS[Math.floor(Math.random() * HARDWARE_MODELS.length)];
    } else if (r < 0.8) {
      type = 'ACCESSORY';
      model = ACCESSORY_MODELS[Math.floor(Math.random() * ACCESSORY_MODELS.length)];
    } else {
      type = 'SOFTWARE';
      model = SOFTWARE_MODELS[Math.floor(Math.random() * SOFTWARE_MODELS.length)];
    }

    const assetId = crypto.randomUUID();
    const location = locations[Math.floor(Math.random() * locations.length)];
    const department = Math.random() > 0.3 && departments.length > 0 
        ? departments[Math.floor(Math.random() * departments.length)] 
        : null;

    // 70% chance do ativo estar em uso
    const isInUse = Math.random() < 0.7;
    const status = isInUse ? 'IN_USE' : 'AVAILABLE';

    assetsToCreate.push({
      id: assetId,
      companyId,
      type,
      model,
      tagNumber: `TAG-${Math.floor(10000 + Math.random() * 90000)}`,
      serial: `SN-${crypto.randomUUID().substring(0, 8).toUpperCase()}`,
      purchaseDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
      value: Math.floor(200 + Math.random() * 8000),
      status,
      locationId: location.id,
      departmentId: department ? department.id : null,
      depreciationMonths: 36,
      createdAt: new Date()
    });

    if (isInUse) {
      const user = users[Math.floor(Math.random() * users.length)];
      assignmentsToCreate.push({
        id: crypto.randomUUID(),
        assetId: assetId,
        userId: user.id,
        assignedAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
        returnedAt: null
      });
    }
  }

  console.log('Inserindo Ativos no banco...');
  await prisma.asset.createMany({ data: assetsToCreate });

  console.log('Inserindo Atribuições (Check-outs)...');
  await prisma.assignment.createMany({ data: assignmentsToCreate });

  console.log(`Sucesso! Criados 100 ativos e ${assignmentsToCreate.length} deles foram atribuídos a colaboradores.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
