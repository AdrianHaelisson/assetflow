import { Context } from 'hono';
import { CreateAsset } from '../../../application/use-cases/CreateAsset';
import { AssignAsset } from '../../../application/use-cases/AssignAsset';
import { GenerateResponsibilityTerm } from '../../../application/use-cases/GenerateResponsibilityTerm';
import { PrismaAssetRepository } from '../../repositories/PrismaAssetRepository';
import { PrismaAssignmentRepository } from '../../repositories/PrismaAssignmentRepository';
import { PrismaUserRepository } from '../../repositories/PrismaUserRepository';
import { prisma } from '../../database/prisma';

const assetRepository = new PrismaAssetRepository();
const assignmentRepository = new PrismaAssignmentRepository();
const userRepository = new PrismaUserRepository();

export class AssetController {
  static async create(c: Context) {
    try {
      const createAsset = new CreateAsset(assetRepository);
      const asset = await createAsset.execute((await c.req.json()));
      return c.json(asset, 201);
    } catch (error) {
      throw error;
    }
  }

  static async assign(c: Context) {
    try {
      const assignAsset = new AssignAsset(assignmentRepository, assetRepository);
      const assignment = await assignAsset.execute({
        assetId: c.req.param('id') as string,
        userId: (await c.req.json()).userId,
      });
      return c.json(assignment, 200);
    } catch (error) {
      throw error;
    }
  }
  
  static async list(c: Context) {
    try {
      const companyId = c.req.query('companyId') as string;
      const locationId = c.req.query('locationId') as string | undefined;
      const departmentId = c.req.query('departmentId') as string | undefined;

      const where: any = { companyId };
      if (locationId) where.locationId = locationId;
      if (departmentId) where.departmentId = departmentId;

      const assets = await prisma.asset.findMany({ where });

      const assetIds = assets.map((a: any) => a.id);
      const activeAssignments = await prisma.assignment.findMany({
        where: { returnedAt: null, assetId: { in: assetIds } },
        include: { user: true }
      });
      const assignmentMap = new Map(activeAssignments.map((a: any) => [a.assetId, { id: a.user.id, name: a.user.name }]));

      const { Asset } = await import('../../../domain/entities/Asset');
      const jsonAssets = assets.map((a: any) => {
        const entity = new Asset({ id: a.id, type: a.type, tagNumber: a.tagNumber, model: a.model, serial: a.serial, purchaseDate: a.purchaseDate, value: a.value, status: a.status, companyId: a.companyId, locationId: a.locationId, depreciationMonths: a.depreciationMonths });
        return {
          id: a.id,
          type: a.type,
          tagNumber: a.tagNumber,
          model: a.model,
          serial: a.serial,
          purchaseDate: a.purchaseDate,
          value: a.value,
          status: a.status,
          companyId: a.companyId,
          locationId: a.locationId,
          departmentId: a.departmentId,
          currentValue: entity.currentValue(),
          assignedUser: assignmentMap.get(a.id)?.name || null,
          assignedUserId: assignmentMap.get(a.id)?.id || null,
        };
      });
      
      return c.json(jsonAssets, 200);
    } catch(error) {
      throw error;
    }
  }


  static async getHistory(c: Context) {
    try {
      const history = await assignmentRepository.findAllByAssetId(c.req.param('id') as string);
      return c.json(history, 200);
    } catch (error) {
      throw error;
    }
  }

  static async getTerm(c: Context) {
    try {
      const generateTerm = new GenerateResponsibilityTerm(assetRepository, assignmentRepository, userRepository);
      const pdfBuffer = await generateTerm.execute(c.req.param('id') as string);
      
      c.header('Content-Type', 'application/pdf');
      c.header('Content-Disposition', `attachment; filename=termo-responsabilidade-${(c.req.param('id') as string)}.pdf`);
      return c.body(pdfBuffer as any);
    } catch (error) {
      throw error;
    }
  }

  static async update(c: Context) {
    try {
      const id = c.req.param('id') as string;
      const existing = await assetRepository.findById(id);
      if (!existing) return c.json({ error: 'Ativo não encontrado' }, 404);

      // Create new entity with merged props
      const { Asset } = await import('../../../domain/entities/Asset');
      const updatedAsset = new Asset({
        id: existing.id,
        type: (await c.req.json()).type || existing.type,
        tagNumber: (await c.req.json()).tagNumber || existing.tagNumber,
        model: (await c.req.json()).model || existing.model,
        serial: (await c.req.json()).serial || existing.serial,
        purchaseDate: (await c.req.json()).purchaseDate ? new Date((await c.req.json()).purchaseDate) : existing.purchaseDate,
        value: (await c.req.json()).value !== undefined ? Number((await c.req.json()).value) : existing.value,
        status: (await c.req.json()).status || existing.status,
        companyId: existing.companyId,
        locationId: (await c.req.json()).locationId !== undefined ? (await c.req.json()).locationId : existing.locationId,
        depreciationMonths: (await c.req.json()).depreciationMonths !== undefined ? Number((await c.req.json()).depreciationMonths) : existing.depreciationMonths,
      });

      await assetRepository.update(updatedAsset);

      await prisma.systemLog.create({
        data: {
          action: 'UPDATE',
          entityType: 'ASSET',
          entityId: id,
          userId: c.get('user')?.id,
          changes: (await c.req.json())
        }
      });

      return c.json({
        id: updatedAsset.id,
        model: updatedAsset.model,
        tagNumber: updatedAsset.tagNumber,
        status: updatedAsset.status
      }, 200);
    } catch (error) {
      throw error;
    }
  }

  static async delete(c: Context) {
    try {
      const id = c.req.param('id') as string;
      await assetRepository.delete(id);

      await prisma.systemLog.create({
        data: {
          action: 'DELETE',
          entityType: 'ASSET',
          entityId: id,
          userId: c.get('user')?.id
        }
      });

      return c.body(null, 204);
    } catch (error) {
      throw error;
    }
  }

  static async getStats(c: Context) {
    try {
      const companyId = c.req.query('companyId') as string || 'comp1';
      const assets = await assetRepository.findAllByCompanyId(companyId);

      const totalValue = assets.reduce((acc, curr) => acc + curr.value, 0);
      const statusCounts = assets.reduce((acc: any, curr: any) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {});

      return c.json({
        total: assets.length,
        inUse: statusCounts['IN_USE'] || 0,
        available: statusCounts['AVAILABLE'] || 0,
        maintenance: statusCounts['MAINTENANCE'] || 0,
        retired: statusCounts['RETIRED'] || 0,
        totalValue,
        statusDistribution: Object.entries(statusCounts).map(([status, count]) => ({ status, count: count as number }))
      }, 200);
    } catch (error) {
      throw error;
    }
  }
}
