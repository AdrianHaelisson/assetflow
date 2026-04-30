import { Context } from 'hono';
import { prisma } from '../../database/prisma';

export class MaintenanceController {
  static async start(c: Context) {
    try {
      const { id: assetId } = c.req.param();
      const { title, provider } = (await c.req.json());

      // Create maintenance record
      const maint = await prisma.assetMaintenance.create({
        data: { assetId: assetId as string, title, provider }
      });

      // Update asset status to MAINTENANCE
      await prisma.asset.update({
        where: { id: assetId },
        data: { status: 'MAINTENANCE' }
      });

      return c.json(maint, 201);
    } catch (e) {
      throw e;
    }
  }

  static async finish(c: Context) {
    try {
      const { id: maintId } = c.req.param();
      const { cost } = (await c.req.json());

      const maint = await prisma.assetMaintenance.findUnique({ where: { id: maintId } });
      if (!maint) throw new Error('Manutenção não encontrada');

      await prisma.assetMaintenance.update({
        where: { id: maintId },
        data: { endDate: new Date(), cost: parseFloat(cost) }
      });

      await prisma.asset.update({
        where: { id: maint.assetId },
        data: { status: 'AVAILABLE' }
      });

      return c.json({ message: 'Maintenance completed' }, 200);
    } catch (e) {
      throw e;
    }
  }

  static async logAudit(c: Context) {
    try {
      const { id: assetId } = c.req.param();
      const userId = c.get('user')?.id || 'sys-auditor';

      await prisma.auditLog.create({
        data: { assetId: assetId as string, userId: userId as string }
      });

      // Push next audit date 6 months into the future
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 6);

      await prisma.asset.update({
        where: { id: assetId },
        data: { nextAuditDate: nextDate }
      });

      return c.json({ message: 'Audit logged successfully', nextAuditDate: nextDate }, 200);
    } catch (e) {
      throw e;
    }
  }
}
