import { Context } from 'hono';

import { prisma } from '../../database/prisma';

export class SystemLogController {
  static async list(c: Context) {
    try {
      const companyId = c.get('user')?.companyId as string;
      const logs = await prisma.systemLog.findMany({
        where: c.get('user')?.role === 'ADMIN' ? {} : { userId: c.get('user')?.id },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      return c.json(logs, 200);
    } catch (error) {
      throw error;
    }
  }
}
