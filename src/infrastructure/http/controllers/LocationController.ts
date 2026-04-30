import { Context } from 'hono';
import { prisma } from '../../database/prisma';

export class LocationController {
  static async list(c: Context) {
    try {
      const companyId = c.get('user')?.companyId as string;
      const locations = await prisma.location.findMany({ 
        where: { companyId },
        include: {
          _count: { select: { assets: true, users: true } }
        }
      });
      const mapped = locations.map(l => ({
        ...l,
        assetCount: l._count.assets,
        userCount: l._count.users,
        _count: undefined
      }));
      return c.json(mapped, 200);
    } catch (e) {
      throw e;
    }
  }
  static async update(c: Context) {
    try {
      const { id } = c.req.param();
      const updated = await prisma.location.update({
        where: { id },
        data: (await c.req.json())
      });
      return c.json(updated, 200);
    } catch (e) {
      throw e;
    }
  }

  static async create(c: Context) {
    try {
      const data = await c.req.json();
      const location = await prisma.location.create({ data });
      return c.json(location, 201);
    } catch (e) {
      throw e;
    }
  }

  static async delete(c: Context) {
    try {
      const { id } = c.req.param();
      await prisma.location.delete({ where: { id } });
      return c.json({ success: true }, 200);
    } catch (e) {
      throw e;
    }
  }
}
