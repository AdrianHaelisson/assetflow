import { UserRepository } from '../../domain/repositories/UserRepository';
import { User, UserRole } from '../../domain/entities/User';
import { prisma } from '../database/prisma';

export class PrismaUserRepository implements UserRepository {
  async save(user: User): Promise<void> {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        companyId: user.companyId,
        locationId: user.locationId || null,
        departmentId: user.departmentId || null,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({ 
      where: { id, deletedAt: null } as any 
    });
    if (!raw) return null;

    return new User({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      passwordHash: raw.passwordHash,
      role: raw.role as UserRole,
      companyId: raw.companyId,
      locationId: (raw as any).locationId,
      departmentId: (raw as any).departmentId,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({ 
      where: { email, deletedAt: null } as any 
    });
    if (!raw) return null;

    return new User({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      passwordHash: raw.passwordHash,
      role: raw.role as UserRole,
      companyId: raw.companyId,
      locationId: (raw as any).locationId,
      departmentId: (raw as any).departmentId,
    });
  }

  async findAllByCompanyId(companyId: string, role?: UserRole): Promise<User[]> {
    const rawList = await prisma.user.findMany({ 
      where: {
        companyId,
        ...(role && { role }),
        deletedAt: null
      } as any,
      orderBy: { createdAt: 'desc' }
    });
    
    return rawList.map(raw => new User({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      passwordHash: raw.passwordHash,
      role: raw.role as UserRole,
      companyId: raw.companyId,
      locationId: (raw as any).locationId,
      departmentId: (raw as any).departmentId,
    }));
  }

  async update(user: User): Promise<void> {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        locationId: user.locationId || null,
        departmentId: user.departmentId || null,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
