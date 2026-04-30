import { Context } from 'hono';
import { prisma } from '../../database/prisma';

export class ComponentController {
  static async list(c: Context) {
    try {
      const companyId = c.get('user')?.companyId as string;
      const data = await prisma.component.findMany({ where: { companyId } });
      return c.json(data, 200);
    } catch (e) {
      throw e;
    }
  }

  static async create(c: Context) {
    try {
      const { name, quantity, serial } = (await c.req.json());
      const companyId = c.get('user')?.companyId as string;
      
      const created = await prisma.component.create({
        data: { name, quantity, serial, companyId }
      });
      return c.json(created, 201);
    } catch (e) {
      throw e;
    }
  }

  static async install(c: Context) {
    try {
       const id = c.req.param('id') as string;
       const { assetId } = (await c.req.json()); // Components are assigned to Assets

       const comp = await prisma.component.findUnique({ where: { id }});
       if(!comp || comp.quantity <= 0) throw new Error('Fora de estoque');

       await prisma.component.update({ where: { id }, data: { quantity: comp.quantity - 1 }});
       const assign = await prisma.componentAssignment.create({ data: { componentId: id, assetId }});

       return c.json(assign, 200);
    } catch (e) {
       throw e;
    }
  }

  static async update(c: Context) {
    try {
      const id = c.req.param('id') as string;
      const { name, quantity, serial } = (await c.req.json());
      const updated = await prisma.component.update({
        where: { id },
        data: {
          name,
          quantity: quantity ? Number(quantity) : undefined,
          serial
        }
      });
      return c.json(updated, 200);
    } catch (e) {
      throw e;
    }
  }
}
