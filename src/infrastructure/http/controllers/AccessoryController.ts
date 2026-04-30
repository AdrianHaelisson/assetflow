import { Context } from 'hono';
import { prisma } from '../../database/prisma';

export class AccessoryController {
  static async list(c: Context) {
    try {
      const companyId = c.get('user')?.companyId as string;
      const data = await prisma.accessory.findMany({ where: { companyId } });
      return c.json(data, 200);
    } catch (e) {
      throw e;
    }
  }

  static async create(c: Context) {
    try {
      const { name, quantity, minQuantity } = (await c.req.json());
      const companyId = c.get('user')?.companyId as string;
      
      const created = await prisma.accessory.create({
        data: { name, quantity, minQuantity, companyId }
      });
      return c.json(created, 201);
    } catch (e) {
      throw e;
    }
  }

  static async checkout(c: Context) {
    try {
       const id = c.req.param('id') as string;
       const { userId } = (await c.req.json());

       const acc = await prisma.accessory.findUnique({ where: { id }});
       if(!acc || acc.quantity <= 0) throw new Error('Fora de estoque');

       await prisma.accessory.update({ where: { id }, data: { quantity: acc.quantity - 1 }});
       const assign = await prisma.accessoryAssignment.create({ data: { accessoryId: id, userId }});

       return c.json(assign, 200);
    } catch (e) {
       throw e;
    }
  }

  static async update(c: Context) {
    try {
      const id = c.req.param('id') as string;
      const { name, quantity, minQuantity } = (await c.req.json());
      const updated = await prisma.accessory.update({
        where: { id },
        data: {
          name,
          quantity: quantity ? Number(quantity) : undefined,
          minQuantity: minQuantity ? Number(minQuantity) : undefined
        }
      });
      return c.json(updated, 200);
    } catch (e) {
      throw e;
    }
  }
}
