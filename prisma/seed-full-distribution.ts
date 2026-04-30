import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FIRST_NAMES = [
  'Ana', 'Carlos', 'Mariana', 'João', 'Fernanda', 'Rafael', 'Juliana', 'Pedro',
  'Camila', 'Lucas', 'Beatriz', 'Mateus', 'Larissa', 'Gabriel', 'Natalia',
  'Felipe', 'Renata', 'Henrique', 'Patrícia', 'Diego', 'Aline', 'Rodrigo',
  'Viviane', 'André', 'Thais', 'Leandro', 'Sandra', 'Bruno', 'Mônica', 'Gustavo',
  'Vanessa', 'Márcio', 'Cristina', 'Alexandre', 'Simone', 'Eduardo', 'Priscila',
  'Fábio', 'Daniela', 'Marcelo', 'Tatiana', 'Vinicius', 'Luciana', 'Leonardo'
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Ferreira', 'Alves', 'Pereira',
  'Lima', 'Gomes', 'Ribeiro', 'Martins', 'Carvalho', 'Rodrigues', 'Nascimento',
  'Araujo', 'Mendes', 'Barbosa', 'Cardoso', 'Rocha', 'Correia', 'Melo'
];

// Keyboards
const KEYBOARDS = [
  'Teclado Mecânico Keychron K2', 'Teclado Dell KB216', 'Teclado Apple Magic Keyboard',
  'Teclado Logitech MK850', 'Teclado Microsoft Ergonomic'
];

// Mice
const MICE = [
  'Mouse Logitech MX Master 3S', 'Mouse Apple Magic Mouse 2', 'Mouse Dell MS116',
  'Mouse Microsoft Arc', 'Mouse Logitech G502'
];

// Monitors
const MONITORS = [
  'Monitor Dell UltraSharp 27"', 'Monitor LG UltraWide 34"', 'Monitor Samsung 27" QHD',
  'Monitor LG 24" Full HD', 'Monitor Dell 24" FHD'
];

// Headsets
const HEADSETS = [
  'Headset Jabra Evolve2 65', 'Headset Logitech H800', 'Headset Sony WH-1000XM5',
  'Headset Microsoft Modern USB-C', 'Headset JBL Quantum 350'
];

// Desktops / CPUs
const DESKTOPS = [
  'ThinkCentre M720q', 'Dell OptiPlex 7090', 'HP EliteDesk 800 G8',
  'Apple Mac Mini M2', 'Dell Precision 3460'
];

// Notebooks
const NOTEBOOKS = [
  'MacBook Pro 14"', 'Dell Latitude 5420', 'Lenovo ThinkPad T14',
  'HP EliteBook 840', 'MacBook Air M2', 'Dell XPS 13'
];

// Webcams
const WEBCAMS = [
  'Logitech Brio 4K Webcam', 'Razer Kiyo Pro', 'Microsoft LifeCam Studio',
  'Logitech C920 HD Pro', 'Elgato Facecam'
];

// Chairs (tracked as accessory)
const CHAIRS = [
  'Cadeira Executiva Flexform', 'Cadeira Beezi Cavaletti', 'Cadeira MyChair Presidente',
  'Cadeira ThunderX3 Gaming Chair', 'Cadeira Ergonômica Knoll Life'
];

const DEPARTMENTS = ['Fiscal', 'Contábil', 'DP', 'Processos', 'Comercial', 'Financeiro', 'Paralegal', 'TI'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSerial() {
  return 'SN-' + crypto.randomUUID().substring(0, 8).toUpperCase();
}

function randomTag(prefix: string, idx: number) {
  return `${prefix}-${String(idx).padStart(4, '0')}`;
}

function randomDate(daysAgo: number) {
  return new Date(Date.now() - Math.floor(Math.random() * daysAgo * 86400000));
}

async function main() {
  const companyId = 'comp1';

  console.log('🔄 Limpando atribuições e ativos antigos...');
  await prisma.assignment.deleteMany({ where: { asset: { companyId } } });
  await prisma.asset.deleteMany({ where: { companyId } });
  // Clean up license assignments that may block user deletion
  await prisma.licenseAssignment.deleteMany({ where: { user: { companyId } } }).catch(() => {});
  console.log('✅ Ativos e atribuições removidos.');

  // Fetch locations
  const locations = await prisma.location.findMany({ where: { companyId } });
  const locHO = locations.find(l => l.name === 'Home Office')!;
  const locARA = locations.find(l => l.name === 'Aracaju')!;
  const locTB = locations.find(l => l.name === 'Tobias Barreto')!;

  if (!locHO || !locARA || !locTB) {
    throw new Error('Sedes não encontradas! Rode o seed de localizações primeiro.');
  }

  // Fetch departments
  const departments = await prisma.department.findMany({ where: { companyId } });

  // Target user counts per location
  const targets = [
    { loc: locHO, count: 5 },
    { loc: locARA, count: 20 },
    { loc: locTB, count: 20 },
  ];

  // Ensure correct number of users per location
  let nameIdx = 0;
  const allUsers: any[] = [];

  for (const { loc, count } of targets) {
    const existing = await prisma.user.findMany({ where: { companyId, locationId: loc.id } });
    console.log(`📍 ${loc.name}: ${existing.length} usuários existentes (meta: ${count})`);

    let users = [...existing];

    // Remove excess users (keep the first `count`)
    if (users.length > count) {
      const toRemove = users.slice(count);
      await prisma.user.deleteMany({ where: { id: { in: toRemove.map(u => u.id) } } });
      users = users.slice(0, count);
      console.log(`   🗑️ Removidos ${toRemove.length} usuários excedentes.`);
    }

    // Add missing users
    while (users.length < count) {
      const firstName = FIRST_NAMES[nameIdx % FIRST_NAMES.length];
      const lastName = LAST_NAMES[nameIdx % LAST_NAMES.length];
      nameIdx++;
      const name = `${firstName} ${lastName}`;
      const slug = name.toLowerCase().replace(/[^a-z]/g, '.').replace(/\.+/g, '.');
      const dep = departments.length > 0 ? pick(departments) : null;

      const newUser = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          companyId,
          name,
          email: `${slug}@empresa.com`,
          passwordHash: '$2b$10$placeholder',
          role: users.length === 0 ? 'MANAGER' : 'EMPLOYEE',
          locationId: loc.id,
          departmentId: dep?.id || null,
        }
      });
      users.push(newUser);
    }

    // Update locationId for any existing users without it
    for (const u of users) {
      if (!u.locationId) {
        await prisma.user.update({ where: { id: u.id }, data: { locationId: loc.id } });
      }
    }

    allUsers.push(...users);
    console.log(`   ✅ ${users.length} usuários prontos em ${loc.name}`);
  }

  console.log(`\n🛠️ Criando kits para ${allUsers.length} colaboradores...`);

  let assetCounter = 1;
  const allAssets: any[] = [];
  const allAssignments: any[] = [];

  for (const user of allUsers) {
    const loc = locations.find(l => l.id === user.locationId)!;
    const isNotebook = Math.random() < 0.45; // 45% chance of notebook
    const monitorCount = isNotebook ? 1 : 2;
    const assignedAt = randomDate(365);

    const createAsset = (type: string, model: string, prefix: string, value: number) => {
      const assetId = crypto.randomUUID();
      const asset = {
        id: assetId,
        companyId,
        type,
        model,
        tagNumber: randomTag(prefix, assetCounter++),
        serial: randomSerial(),
        purchaseDate: randomDate(730),
        value,
        status: 'IN_USE',
        locationId: loc.id,
        departmentId: user.departmentId || null,
        depreciationMonths: 36,
        createdAt: randomDate(700),
      };
      allAssets.push(asset);
      allAssignments.push({
        id: crypto.randomUUID(),
        assetId,
        userId: user.id,
        assignedAt,
        returnedAt: null,
      });
    };

    // Kit: Teclado
    createAsset('ACCESSORY', pick(KEYBOARDS), 'TEC', Math.floor(150 + Math.random() * 350));

    // Kit: Mouse
    createAsset('ACCESSORY', pick(MICE), 'MOU', Math.floor(100 + Math.random() * 500));

    // Kit: Monitor(es)
    for (let m = 0; m < monitorCount; m++) {
      createAsset('ACCESSORY', pick(MONITORS), 'MON', Math.floor(800 + Math.random() * 1500));
    }

    // Kit: Headset
    createAsset('ACCESSORY', pick(HEADSETS), 'HEAD', Math.floor(200 + Math.random() * 800));

    // Kit: CPU ou Notebook
    if (isNotebook) {
      createAsset('HARDWARE', pick(NOTEBOOKS), 'NTB', Math.floor(2500 + Math.random() * 6000));
    } else {
      createAsset('HARDWARE', pick(DESKTOPS), 'CPU', Math.floor(1500 + Math.random() * 4000));
    }

    // Kit: Webcam
    createAsset('ACCESSORY', pick(WEBCAMS), 'CAM', Math.floor(200 + Math.random() * 600));

    // Kit: Cadeira
    createAsset('ACCESSORY', pick(CHAIRS), 'CAD', Math.floor(800 + Math.random() * 2000));
  }

  // Add ~20 spare/available assets distributed across locations
  const spareModels = [
    { type: 'HARDWARE', model: 'Dell Latitude 5420 (Spare)', prefix: 'SPR', value: 3500 },
    { type: 'ACCESSORY', model: 'Mouse Logitech G502 (Reserva)', prefix: 'SPR', value: 250 },
    { type: 'ACCESSORY', model: 'Monitor LG 24" Full HD (Reserva)', prefix: 'SPR', value: 900 },
    { type: 'SOFTWARE', model: 'Licença Office 365 E3', prefix: 'LIC', value: 1200 },
    { type: 'SOFTWARE', model: 'Adobe Creative Cloud', prefix: 'LIC', value: 2000 },
    { type: 'SOFTWARE', model: 'JetBrains All Products', prefix: 'LIC', value: 1800 },
  ];

  for (let i = 0; i < 20; i++) {
    const s = spareModels[i % spareModels.length];
    const loc = locations[i % locations.length];
    allAssets.push({
      id: crypto.randomUUID(),
      companyId,
      type: s.type,
      model: s.model,
      tagNumber: randomTag(s.prefix, assetCounter++),
      serial: randomSerial(),
      purchaseDate: randomDate(500),
      value: s.value,
      status: 'AVAILABLE',
      locationId: loc.id,
      departmentId: null,
      depreciationMonths: 36,
      createdAt: randomDate(490),
    });
  }

  console.log(`\n💾 Inserindo ${allAssets.length} ativos no banco...`);

  // Insert in chunks to avoid query limits
  const CHUNK = 50;
  for (let i = 0; i < allAssets.length; i += CHUNK) {
    await prisma.asset.createMany({ data: allAssets.slice(i, i + CHUNK) });
    process.stdout.write(`   ${Math.min(i + CHUNK, allAssets.length)}/${allAssets.length} ativos...\r`);
  }
  console.log('');

  console.log(`💾 Inserindo ${allAssignments.length} atribuições...`);
  for (let i = 0; i < allAssignments.length; i += CHUNK) {
    await prisma.assignment.createMany({ data: allAssignments.slice(i, i + CHUNK) });
    process.stdout.write(`   ${Math.min(i + CHUNK, allAssignments.length)}/${allAssignments.length} atribuições...\r`);
  }
  console.log('');

  console.log('\n🎉 Distribuição completa!');
  console.log(`   👥 Colaboradores: ${allUsers.length} (HO: 5, ARA: 20, TB: 20)`);
  console.log(`   📦 Ativos criados: ${allAssets.length}`);
  console.log(`   🔗 Atribuições: ${allAssignments.length}`);
  console.log(`   📋 Itens livres (reserva): 20`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
