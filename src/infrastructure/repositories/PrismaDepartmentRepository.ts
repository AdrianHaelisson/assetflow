import { Department } from '../../domain/entities/Department';
import { prisma } from '../database/prisma';

export class PrismaDepartmentRepository {
  async save(department: Department): Promise<void> {
    await prisma.department.create({
      data: {
        id: department.id,
        name: department.name,
        companyId: department.companyId,
        locationId: department.locationId || null,
      },
    });
  }

  async findById(id: string): Promise<Department | null> {
    const raw = await prisma.department.findUnique({
      where: { id, deletedAt: null } as any,
    });
    if (!raw) return null;

    return new Department({
      id: raw.id,
      name: raw.name,
      companyId: raw.companyId,
      locationId: raw.locationId,
    });
  }

  async findAllByCompanyId(companyId: string): Promise<Department[]> {
    const rawList = await prisma.department.findMany({
      where: { companyId, deletedAt: null } as any,
    });
    return rawList.map(raw => new Department({
      id: raw.id,
      name: raw.name,
      companyId: raw.companyId,
      locationId: raw.locationId,
    }));
  }

  async update(department: Department): Promise<void> {
    await prisma.department.update({
      where: { id: department.id },
      data: {
        name: department.name,
        locationId: department.locationId || null,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.department.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
