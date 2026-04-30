import { Context } from 'hono';

import { CreateCollaborator } from '../../../application/use-cases/CreateCollaborator';
import { ListCollaborators } from '../../../application/use-cases/ListCollaborators';
import { PrismaUserRepository } from '../../repositories/PrismaUserRepository';
import { prisma } from '../../database/prisma';

const userRepository = new PrismaUserRepository();

export class CollaboratorController {
  static async create(c: Context) {
    try {
      const createCollaborator = new CreateCollaborator(userRepository);
      const collaborator = await createCollaborator.execute({
        name: (await c.req.json()).name,
        email: (await c.req.json()).email,
        companyId: c.get('user')?.companyId as string,
      });
      return c.json(collaborator, 201);
    } catch (error) {
      throw error;
    }
  }

  static async list(c: Context) {
    try {
      const companyId = c.get('user')?.companyId as string;
      const locationId = c.req.query('locationId') as string | undefined;
      const departmentId = c.req.query('departmentId') as string | undefined;

      const where: any = { companyId };
      if (locationId) where.locationId = locationId;
      if (departmentId) where.departmentId = departmentId;

      const collaborators = await prisma.user.findMany({
        where,
        include: {
          location: { select: { name: true } },
          department: { select: { name: true } },
          _count: {
            select: {
              assignments: { where: { returnedAt: null } }
            }
          }
        }
      });
      const mapped = collaborators.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        companyId: u.companyId,
        locationId: u.locationId,
        locationName: u.location?.name || null,
        departmentId: u.departmentId,
        departmentName: u.department?.name || null,
        createdAt: u.createdAt,
        assetCount: u._count.assignments,
      }));
      return c.json(mapped, 200);
    } catch(error) {
      throw error;
    }
  }

  static async update(c: Context) {
    try {
      const id = c.req.param('id') as string;
      const user = await userRepository.findById(id);
      if (!user) return c.json({ error: 'User not found' }, 404);

      // Update props
      Object.assign((user as any).props, (await c.req.json()));
      await userRepository.update(user);

      await prisma.systemLog.create({
        data: {
          action: 'UPDATE',
          entityType: 'USER',
          entityId: id,
          userId: c.get('user')?.id,
          changes: (await c.req.json())
        }
      });

      return c.json(user, 200);
    } catch (error) {
      throw error;
    }
  }

  static async delete(c: Context) {
    try {
      const id = c.req.param('id') as string;
      await userRepository.delete(id);

      await prisma.systemLog.create({
        data: {
          action: 'DELETE',
          entityType: 'USER',
          entityId: id,
          userId: c.get('user')?.id
        }
      });

      return c.body(null, 204);
    } catch (error) {
      throw error;
    }
  }

  static async getAssignments(c: Context) {
    try {
      const userId = c.req.param('id') as string;
      const assignments = await prisma.assignment.findMany({
        where: { userId, returnedAt: null },
        include: { asset: true }
      });
      return c.json(assignments.map((a: any) => a.asset), 200);
    } catch (error) {
      throw error;
    }
  }
}
