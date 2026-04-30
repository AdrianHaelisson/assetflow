import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding rich dummy data into AssetFlow database...');

  // ─── COMPANY ───────────────────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { cnpj: '11.222.333/0001-99' },
    update: {},
    create: {
      id: 'comp1',
      name: 'TechFlow Global S.A.',
      cnpj: '11.222.333/0001-99',
      address: 'Avenida Paulista, 1776 - Bela Vista, São Paulo - SP, 01310-924',
    },
  });
  console.log(`✅ Company: ${company.name}`);

  // ─── LOCATIONS ─────────────────────────────────────────────────
  const locations = await Promise.all([
    prisma.location.upsert({ where: { id: 'loc-sp' }, update: {}, create: { id: 'loc-sp', name: 'Sede Administrativa - São Paulo', type: 'BRANCH', companyId: company.id } }),
    prisma.location.upsert({ where: { id: 'loc-aju' }, update: {}, create: { id: 'loc-aju', name: 'Sede Aracaju', type: 'BRANCH', companyId: company.id } }),
    prisma.location.upsert({ where: { id: 'loc-tb' }, update: {}, create: { id: 'loc-tb', name: 'Sede Tobias Barreto', type: 'BRANCH', companyId: company.id } }),
    prisma.location.upsert({ where: { id: 'loc-dc' }, update: {}, create: { id: 'loc-dc', name: 'Data Center - Campinas', type: 'STORAGE', companyId: company.id } }),
    prisma.location.upsert({ where: { id: 'loc-ho' }, update: {}, create: { id: 'loc-ho', name: 'Home Office / Remoto', type: 'OFFICE', companyId: company.id } }),
  ]);
  const [locSP, locAJU, locTB, locDC, locHO] = locations;
  console.log(`✅ Locations: ${locations.length} created`);

  // ─── DEPARTMENTS ───────────────────────────────────────────────
  const departmentsData = [
    { id: 'dep-ti', name: 'TI', locId: locSP.id },
    { id: 'dep-rh', name: 'Recursos Humanos', locId: locSP.id },
    { id: 'dep-fin', name: 'Financeiro', locId: locSP.id },
    { id: 'dep-com', name: 'Comercial', locId: locAJU.id },
    { id: 'dep-fis', name: 'Fiscal', locId: locTB.id },
    { id: 'dep-jur', name: 'Jurídico / Paralegal', locId: locAJU.id },
    { id: 'dep-dp', name: 'Departamento Pessoal', locId: locTB.id },
    { id: 'dep-con', name: 'Contábil', locId: locTB.id },
  ];

  const departments: Record<string, any> = {};
  for (const d of departmentsData) {
    departments[d.id] = await prisma.department.upsert({
      where: { id: d.id },
      update: {},
      create: { id: d.id, name: d.name, companyId: company.id, locationId: d.locId },
    });
  }
  console.log(`✅ Departments: ${departmentsData.length} created`);

  // ─── USERS ─────────────────────────────────────────────────────
  const usersData = [
    { id: 'u-admin', name: 'Administrador', email: 'admin@assetflow.com', role: 'ADMIN', locationId: locSP.id },
    { id: 'u-ti1', name: 'Fernanda Costa', email: 'f.costa@techflow.com', role: 'TECHNICIAN', locationId: locSP.id },
    { id: 'u-ti2', name: 'Carlos Mendes', email: 'c.mendes@techflow.com', role: 'TECHNICIAN', locationId: locRJ.id },
    { id: 'u-emp1', name: 'João Silva', email: 'j.silva@techflow.com', role: 'EMPLOYEE', locationId: locSP.id },
    { id: 'u-emp2', name: 'Ana Beatriz Santos', email: 'a.santos@techflow.com', role: 'EMPLOYEE', locationId: locRJ.id },
    { id: 'u-emp3', name: 'Lucas Ferreira', email: 'l.ferreira@techflow.com', role: 'EMPLOYEE', locationId: locSul.id },
    { id: 'u-emp4', name: 'Mariana Oliveira', email: 'm.oliveira@techflow.com', role: 'EMPLOYEE', locationId: locSP.id },
    { id: 'u-emp5', name: 'Pedro Henrique Rocha', email: 'p.rocha@techflow.com', role: 'EMPLOYEE', locationId: locHO.id },
    { id: 'u-emp6', name: 'Juliana Martins', email: 'j.martins@techflow.com', role: 'EMPLOYEE', locationId: locRJ.id },
    { id: 'u-emp7', name: 'Rafael Lima', email: 'r.lima@techflow.com', role: 'EMPLOYEE', locationId: locSul.id },
    { id: 'u-emp8', name: 'Camila Souza', email: 'c.souza@techflow.com', role: 'EMPLOYEE', locationId: locSP.id },
    { id: 'u-emp9', name: 'Diego Carvalho', email: 'd.carvalho@techflow.com', role: 'EMPLOYEE', locationId: locHO.id },
    { id: 'u-emp10', name: 'Patrícia Nunes', email: 'p.nunes@techflow.com', role: 'EMPLOYEE', locationId: locRJ.id },
    { id: 'u-manager1', name: 'Sandro Ribeiro', email: 's.ribeiro@techflow.com', role: 'MANAGER', locationId: locSP.id },
    { id: 'u-manager2', name: 'Tatiane Gomes', email: 't.gomes@techflow.com', role: 'MANAGER', locationId: locRJ.id },
  ];

  const passwordHash = await bcrypt.hash('assetflow@2025', 10);

  const users: Record<string, any> = {};
    for (const u of usersData) {
      // Logic to assign some departments
      let depId = null;
      if (u.id.includes('ti')) depId = 'dep-ti';
      else if (u.id.includes('admin')) depId = 'dep-ti';
      else if (u.id.includes('emp1')) depId = 'dep-rh';
      else if (u.id.includes('emp4')) depId = 'dep-fin';
      else if (u.id.includes('emp2')) depId = 'dep-com';
      else if (u.id.includes('emp5')) depId = 'dep-dp';

      users[u.id] = await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: { id: u.id, name: u.name, email: u.email, role: u.role, passwordHash, companyId: company.id, locationId: u.locationId, departmentId: depId },
      });
    }
  console.log(`✅ Users: ${usersData.length} created (password: assetflow@2025)`);

  // ─── ASSETS ─────────────────────────────────────────────────────
  const assetsData = [
    { tag: 'MAC-001', type: 'NOTEBOOK', model: 'MacBook Pro 16" M3 Max 32GB RAM', serial: 'C02ABC1234', value: 28500, status: 'IN_USE', locId: locSP.id, dep: 36, purchase: '2024-03-01' },
    { tag: 'MAC-002', type: 'NOTEBOOK', model: 'MacBook Air 13" M2 16GB', serial: 'C02DEF5678', value: 12000, status: 'IN_USE', locId: locRJ.id, dep: 36, purchase: '2024-06-15' },
    { tag: 'DELL-001', type: 'NOTEBOOK', model: 'Dell XPS 15 i7 32GB', serial: 'SN-XPS-9510', value: 14500, status: 'AVAILABLE', locId: locSP.id, dep: 48, purchase: '2023-11-10' },
    { tag: 'DELL-002', type: 'DESKTOP', model: 'Dell OptiPlex 7090 i5 16GB', serial: 'SN-DLL-998', value: 8500, status: 'AVAILABLE', locId: locSul.id, dep: 60, purchase: '2023-05-20' },
    { tag: 'DELL-003', type: 'DESKTOP', model: 'Dell Precision Tower 7960', serial: 'SN-DLL-PRE-7960', value: 32000, status: 'IN_USE', locId: locDC.id, dep: 60, purchase: '2024-01-15' },
    { tag: 'HP-001', type: 'NOTEBOOK', model: 'HP EliteBook 850 G9 i7', serial: 'CNU123456', value: 11200, status: 'IN_USE', locId: locRJ.id, dep: 48, purchase: '2023-08-01' },
    { tag: 'HP-002', type: 'PRINTER', model: 'HP LaserJet Pro M404dn', serial: 'VND334567', value: 3200, status: 'AVAILABLE', locId: locSP.id, dep: 84, purchase: '2022-04-01' },
    { tag: 'HP-003', type: 'PRINTER', model: 'HP Color LaserJet M553n', serial: 'VND889988', value: 7800, status: 'MAINTENANCE', locId: locRJ.id, dep: 84, purchase: '2021-09-15' },
    { tag: 'IPAD-001', type: 'TABLET', model: 'Apple iPad Pro 12.9" M2', serial: 'DLXQ2L3P', value: 9500, status: 'IN_USE', locId: locSP.id, dep: 36, purchase: '2024-02-10' },
    { tag: 'IPAD-002', type: 'TABLET', model: 'Apple iPad Air 10.9"', serial: 'FMHP56MN', value: 5800, status: 'AVAILABLE', locId: locHO.id, dep: 36, purchase: '2023-12-05' },
    { tag: 'SRV-001', type: 'SERVER', model: 'Dell PowerEdge R750xs 2x Xeon 256GB', serial: 'SRV-DLL-001', value: 85000, status: 'IN_USE', locId: locDC.id, dep: 60, purchase: '2023-01-20' },
    { tag: 'SRV-002', type: 'SERVER', model: 'HP ProLiant DL380 Gen10', serial: 'SRV-HP-002', value: 62000, status: 'IN_USE', locId: locDC.id, dep: 60, purchase: '2022-07-01' },
    { tag: 'PRJ-001', type: 'PROJECTOR', model: 'Epson EB-L400U Laser 4500lm', serial: 'PROJ-EPS-001', value: 12800, status: 'AVAILABLE', locId: locSP.id, dep: 84, purchase: '2022-03-15' },
    { tag: 'MON-001', type: 'MONITOR', model: 'LG UltraWide 34" 4K QHD', serial: 'MON-LG-001', value: 4500, status: 'IN_USE', locId: locSP.id, dep: 60, purchase: '2023-10-01' },
    { tag: 'MON-002', type: 'MONITOR', model: 'Samsung Odyssey 27" 165Hz', serial: 'MON-SAM-002', value: 3200, status: 'AVAILABLE', locId: locRJ.id, dep: 60, purchase: '2024-01-10' },
    { tag: 'NET-001', type: 'NETWORK', model: 'Cisco Catalyst 9200L 24-port', serial: 'CISCO-9200-001', value: 18500, status: 'IN_USE', locId: locDC.id, dep: 60, purchase: '2022-06-01' },
    { tag: 'NET-002', type: 'NETWORK', model: 'Ubiquiti UniFi Dream Machine Pro', serial: 'UNIFI-DMP-001', value: 4200, status: 'IN_USE', locId: locSP.id, dep: 60, purchase: '2023-04-01' },
    { tag: 'CAM-001', type: 'CAMERA', model: 'Logitech Brio 4K Webcam', serial: 'CAM-LOG-001', value: 1800, status: 'RETIRED', locId: locSP.id, dep: 36, purchase: '2021-01-01' },
    { tag: 'NTB-001', type: 'NOTEBOOK', model: 'Lenovo ThinkPad X1 Carbon Gen 11', serial: 'LN-X1C-001', value: 13500, status: 'IN_USE', locId: locSP.id, dep: 48, purchase: '2023-09-01' },
    { tag: 'DOCK-001', type: 'ACCESSORIES', model: 'Thunderbolt 4 Dock Station 12 portas', serial: 'DOCK-TB4-001', value: 2800, status: 'AVAILABLE', locId: locHO.id, dep: 48, purchase: '2024-01-01' },
  ];

  const assetIds: Record<string, string> = {};
  for (const a of assetsData) {
    const asset = await prisma.asset.upsert({
      where: { tagNumber: a.tag },
      update: {},
      create: {
        tagNumber: a.tag, type: a.type, model: a.model, serial: a.serial,
        value: a.value, status: a.status, companyId: company.id, locationId: a.locId,
        departmentId: a.tag.startsWith('MAC') ? 'dep-ti' : (a.tag.startsWith('DELL') ? 'dep-ti' : null),
        depreciationMonths: a.dep, purchaseDate: new Date(a.purchase),
        nextAuditDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      },
    });
    assetIds[a.tag] = asset.id;
  }
  console.log(`✅ Assets: ${assetsData.length} created`);

  // ─── ASSIGNMENTS (atribuições de ativos) ────────────────────────
  const assignmentsData = [
    { tag: 'MAC-001', uid: 'u-admin' },
    { tag: 'MAC-002', uid: 'u-emp2' },
    { tag: 'HP-001', uid: 'u-emp6' },
    { tag: 'DELL-003', uid: 'u-ti1' },
    { tag: 'IPAD-001', uid: 'u-manager1' },
    { tag: 'MON-001', uid: 'u-emp1' },
    { tag: 'NTB-001', uid: 'u-emp8' },
    { tag: 'SRV-001', uid: 'u-ti2' },
    { tag: 'SRV-002', uid: 'u-ti2' },
    { tag: 'NET-001', uid: 'u-ti1' },
    { tag: 'NET-002', uid: 'u-ti1' },
  ];
  for (const a of assignmentsData) {
    if (assetIds[a.tag] && users[a.uid]) {
      await prisma.assignment.create({ data: { assetId: assetIds[a.tag], userId: users[a.uid].id, assignedAt: new Date() } }).catch(() => {});
    }
  }
  console.log(`✅ Assignments: ${assignmentsData.length} created`);

  // ─── CONSUMABLES ───────────────────────────────────────────────
  const consumables = [
    { name: 'Toner HP LaserJet 26A', quantity: 18 },
    { name: 'Resma Papel Sulfite A4 500fls', quantity: 250 },
    { name: 'Mouse USB Multilaser', quantity: 32 },
    { name: 'Cabo HDMI 2.0 2m', quantity: 45 },
    { name: 'Cabo USB-C para USB-C 1m', quantity: 28 },
    { name: 'Pasta Térmica Arctic MX-4', quantity: 12 },
    { name: 'Álcool Isopropílico 99% 500ml', quantity: 8 },
    { name: 'Pen Drive Kingston 32GB USB 3.0', quantity: 20 },
  ];
  for (const c of consumables) {
    await prisma.consumable.create({ data: { ...c, companyId: company.id } });
  }
  console.log(`✅ Consumables: ${consumables.length} created`);

  // ─── LICENSES ──────────────────────────────────────────────────
  const licensesData = [
    { name: 'Microsoft 365 Business Premium', totalSeats: 20, isPerpetual: false, expiration: '2027-03-31' },
    { name: 'Adobe Creative Cloud (All Apps)', totalSeats: 8, isPerpetual: false, expiration: '2026-12-31' },
    { name: 'Slack Pro', totalSeats: 50, isPerpetual: false, expiration: '2026-09-01' },
    { name: 'GitHub Enterprise', totalSeats: 15, isPerpetual: false, expiration: '2027-01-01' },
    { name: 'Zoom Business', totalSeats: 30, isPerpetual: false, expiration: '2026-11-15' },
    { name: 'JetBrains All Products Pack', totalSeats: 5, isPerpetual: true, expiration: null },
  ];
  const licenseIds: string[] = [];
  for (const l of licensesData) {
    const lic = await prisma.license.create({
      data: { name: l.name, totalSeats: l.totalSeats, isPerpetual: l.isPerpetual, expirationDate: l.expiration ? new Date(l.expiration) : null, companyId: company.id },
    });
    licenseIds.push(lic.id);
  }
  // Assign some licenses
  const licAssigns = [
    { licIdx: 0, uid: 'u-admin' }, { licIdx: 0, uid: 'u-manager1' }, { licIdx: 0, uid: 'u-manager2' },
    { licIdx: 1, uid: 'u-ti1' }, { licIdx: 1, uid: 'u-emp1' },
    { licIdx: 2, uid: 'u-emp2' }, { licIdx: 2, uid: 'u-emp3' }, { licIdx: 2, uid: 'u-emp4' },
    { licIdx: 3, uid: 'u-ti1' }, { licIdx: 3, uid: 'u-ti2' },
    { licIdx: 4, uid: 'u-admin' }, { licIdx: 4, uid: 'u-emp5' },
    { licIdx: 5, uid: 'u-ti1' },
  ];
  for (const la of licAssigns) {
    if (licenseIds[la.licIdx] && users[la.uid]) {
      await prisma.licenseAssignment.create({ data: { licenseId: licenseIds[la.licIdx], userId: users[la.uid].id } }).catch(() => {});
    }
  }
  console.log(`✅ Licenses: ${licensesData.length} created with assignments`);

  // ─── ACCESSORIES ───────────────────────────────────────────────
  const accessories = [
    { name: 'Monitor LG UltraWide 29" (Periférico)', quantity: 14, minQuantity: 3 },
    { name: 'Teclado Mecânico Keychron K2 Pro', quantity: 20, minQuantity: 5 },
    { name: 'Mouse Logitech MX Master 3S', quantity: 18, minQuantity: 4 },
    { name: 'Headset Jabra Evolve2 75', quantity: 10, minQuantity: 2 },
    { name: 'Webcam Logitech C920 HD', quantity: 8, minQuantity: 2 },
    { name: 'Hub USB-C 7-em-1 Anker', quantity: 25, minQuantity: 5 },
  ];
  for (const a of accessories) {
    await prisma.accessory.create({ data: { ...a, companyId: company.id } });
  }
  console.log(`✅ Accessories: ${accessories.length} created`);

  // ─── COMPONENTS ────────────────────────────────────────────────
  const components = [
    { name: 'Memória RAM Corsair DDR4 16GB 3200MHz', serial: 'RAM-CRS-01', quantity: 24 },
    { name: 'SSD Kingston NV2 1TB NVMe M.2', serial: 'SSD-KNG-01', quantity: 18 },
    { name: 'SSD Samsung 870 EVO 500GB SATA', serial: 'SSD-SAM-01', quantity: 12 },
    { name: 'Placa de Rede Intel I350-T2 Dual Gigabit', serial: 'NIC-INT-01', quantity: 6 },
    { name: 'Fonte Dell 750W Gold Certificada', serial: 'PSU-DLL-01', quantity: 4 },
  ];
  for (const c of components) {
    await prisma.component.create({ data: { ...c, companyId: company.id } });
  }
  console.log(`✅ Components: ${components.length} created`);

  console.log('\n🎉 Seeding completed successfully! AssetFlow is populated with rich data.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
