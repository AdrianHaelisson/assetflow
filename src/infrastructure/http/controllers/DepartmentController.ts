import { Context } from 'hono';
import { prisma } from '../../database/prisma';
import { PrismaDepartmentRepository } from '../../repositories/PrismaDepartmentRepository';
import { Department } from '../../../domain/entities/Department';

const departmentRepository = new PrismaDepartmentRepository();

export class DepartmentController {
  static async create(c: Context) {
    try {
      const { name, locationId } = (await c.req.json());
      const companyId = c.get('user')?.companyId || 'comp1';
      
      const department = new Department({
        name,
        companyId,
        locationId
      });

      await departmentRepository.save(department);
      
      await prisma.systemLog.create({
        data: {
          action: 'CREATE',
          entityType: 'DEPARTMENT',
          entityId: department.id,
          userId: c.get('user')?.id,
          changes: (await c.req.json())
        }
      });

      return c.json(department, 201);
    } catch (error) {
      throw error;
    }
  }

  static async list(c: Context) {
    try {
      const companyId = c.get('user')?.companyId || 'comp1';
      const departments = await prisma.department.findMany({
        where: { companyId },
        include: {
          _count: { select: { assets: true, users: true } }
        }
      });
      
      const jsonDepartments = departments.map(d => ({
        id: d.id,
        name: d.name,
        companyId: d.companyId,
        locationId: d.locationId,
        assetCount: d._count.assets,
        userCount: d._count.users
      }));

      return c.json(jsonDepartments, 200);
    } catch (error) {
      throw error;
    }
  }

  static async update(c: Context) {
    try {
      const id = c.req.param('id') as string;
      const existing = await departmentRepository.findById(id);
      if (!existing) return c.json({ error: 'Department not found' }, 404);

      const updated = new Department({
        id: existing.id,
        name: (await c.req.json()).name || existing.name,
        companyId: existing.companyId,
        locationId: (await c.req.json()).locationId !== undefined ? (await c.req.json()).locationId : existing.locationId
      });

      await departmentRepository.update(updated);

      await prisma.systemLog.create({
        data: {
          action: 'UPDATE',
          entityType: 'DEPARTMENT',
          entityId: id,
          userId: c.get('user')?.id,
          changes: (await c.req.json())
        }
      });

      return c.json(updated, 200);
    } catch (error) {
      throw error;
    }
  }

  static async delete(c: Context) {
    try {
      const id = c.req.param('id') as string;
      await departmentRepository.delete(id);

      await prisma.systemLog.create({
        data: {
          action: 'DELETE',
          entityType: 'DEPARTMENT',
          entityId: id,
          userId: c.get('user')?.id
        }
      });

      return c.body(null, 204);
    } catch (error) {
      throw error;
    }
  }
}
