import { Context } from 'hono';
import { prisma } from '../../database/prisma';

export class LicenseController {
  static async list(c: Context) {
    try {
      const companyId = c.get('user')?.companyId as string;
      const data = await prisma.license.findMany({ where: { companyId }, include: { assignments: true } });
      return c.json(data, 200);
    } catch (e) {
      throw e;
    }
  }

  static async create(c: Context) {
    try {
      const { name, totalSeats, isPerpetual, expirationDate } = (await c.req.json());
      const companyId = c.get('user')?.companyId as string;
      
      const created = await prisma.license.create({
        data: { name, totalSeats, isPerpetual, expirationDate: expirationDate ? new Date(expirationDate) : null, companyId }
      });
      return c.json(created, 201);
    } catch (e) {
      throw e;
    }
  }

  static async assign(c: Context) {
    try {
      const { id } = c.req.param();
      const { userId } = (await c.req.json());
      
      const license = await prisma.license.findUnique({ where: { id }, include: { assignments: true } });
      if (!license) throw new Error('Licença não encontrada');
      if (license.assignments.filter(a => !a.returnedAt).length >= license.totalSeats) {
         throw new Error('Não há assentos disponíveis para esta licença');
      }

      const assignment = await prisma.licenseAssignment.create({
        data: { licenseId: id as string, userId: userId as string }
      });
      return c.json(assignment, 200);
    } catch (e) {
      throw e;
    }
  }

  static async update(c: Context) {
    try {
      const { id } = c.req.param();
      const { name, totalSeats, isPerpetual, expirationDate } = (await c.req.json());
      const updated = await prisma.license.update({
        where: { id },
        data: {
          name,
          totalSeats: totalSeats ? Number(totalSeats) : undefined,
          isPerpetual,
          expirationDate: expirationDate ? new Date(expirationDate) : undefined
        }
      });
      return c.json(updated, 200);
    } catch (e) {
      throw e;
    }
  }
}
