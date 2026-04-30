import { AssignmentRepository } from '../../domain/repositories/AssignmentRepository';
import { Assignment } from '../../domain/entities/Assignment';
import { prisma } from '../database/prisma';

export class PrismaAssignmentRepository implements AssignmentRepository {
  async save(assignment: Assignment): Promise<void> {
    await prisma.assignment.create({
      data: {
        id: assignment.id,
        assetId: assignment.assetId,
        userId: assignment.userId,
        assignedAt: assignment.assignedAt,
        returnedAt: assignment.returnedAt,
      },
    });
  }

  async findById(id: string): Promise<Assignment | null> {
    const raw = await prisma.assignment.findUnique({ where: { id } });
    if (!raw) return null;

    return new Assignment({
      id: raw.id,
      assetId: raw.assetId,
      userId: raw.userId,
      assignedAt: raw.assignedAt,
      returnedAt: raw.returnedAt,
    });
  }

  async findActiveByAssetId(assetId: string): Promise<Assignment | null> {
    const raw = await prisma.assignment.findFirst({
      where: {
        assetId,
        returnedAt: null,
      },
    });
    if (!raw) return null;

    return new Assignment({
      id: raw.id,
      assetId: raw.assetId,
      userId: raw.userId,
      assignedAt: raw.assignedAt,
      returnedAt: raw.returnedAt,
    });
  }

  async findAllByAssetId(assetId: string): Promise<Assignment[]> {
    const rawList = await prisma.assignment.findMany({
      where: { assetId },
      orderBy: { assignedAt: 'desc' },
      include: { user: true }
    });

    // Note: We're augmenting the domain entity dynamically with userName for presentation
    return rawList.map(raw => {
      const assignment = new Assignment({
        id: raw.id,
        assetId: raw.assetId,
        userId: raw.userId,
        assignedAt: raw.assignedAt,
        returnedAt: raw.returnedAt,
      });
      (assignment as any).userName = raw.user?.name;
      return assignment;
    });
  }


  async update(assignment: Assignment): Promise<void> {
    await prisma.assignment.update({
      where: { id: assignment.id },
      data: {
        returnedAt: assignment.returnedAt,
      },
    });
  }
}
