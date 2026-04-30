import { Context } from 'hono';
import { prisma } from '../../database/prisma';
import { Consumable } from '../../../domain/entities/Consumable';

export class ConsumableController {
  static async list(c: Context) {
    try {
      const companyId = c.get('user')?.companyId as string;
      const consumables = await prisma.consumable.findMany({ where: { companyId } });
      return c.json(consumables, 200);
    } catch (e) {
      throw e;
    }
  }

  static async create(c: Context) {
    try {
      const { name, quantity } = (await c.req.json());
      const companyId = c.get('user')?.companyId as string;
      const consumable = new Consumable(name, quantity, companyId);
      
      const created = await prisma.consumable.create({
        data: { id: consumable.id, name: consumable.name, quantity: consumable.quantity, companyId }
      });
      return c.json(created, 201);
    } catch (e) {
      throw e;
    }
  }

  static async checkout(c: Context) {
    try {
      const { id } = c.req.param();
      const raw = await prisma.consumable.findUnique({ where: { id } });
      if (!raw) throw new Error('Consumível não encontrado');

      const consumable = new Consumable(raw.name, raw.quantity, raw.companyId, raw.id);
      consumable.checkout(1);

      const updated = await prisma.consumable.update({
        where: { id },
        data: { quantity: consumable.quantity }
      });
      return c.json(updated, 200);
    } catch (e) {
      throw e;
    }
  }

  static async update(c: Context) {
    try {
      const { id } = c.req.param();
      const updated = await prisma.consumable.update({
        where: { id },
        data: (await c.req.json())
      });
      return c.json(updated, 200);
    } catch (e) {
      throw e;
    }
  }
}
