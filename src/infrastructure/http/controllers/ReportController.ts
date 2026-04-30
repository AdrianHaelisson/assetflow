import { Context } from 'hono';

import { GenerateDashboardReport } from '../../../application/use-cases/GenerateDashboardReport';
import { PrismaAssetRepository } from '../../repositories/PrismaAssetRepository';

const assetRepository = new PrismaAssetRepository();

export class ReportController {
  static async getDashboardReport(c: Context) {
    try {
      const reportCase = new GenerateDashboardReport(assetRepository);
      const report = await reportCase.execute({
         companyId: c.get('user')?.companyId as string,
      });
      return c.json(report, 200);
    } catch (error) {
      throw error;
    }
  }

  static async exportAssetsCSV(c: Context) {
    try {
      const companyId = c.get('user')?.companyId as string;
      const assets = await assetRepository.findAllByCompanyId(companyId);

      const header = ['ID', 'Tag Ativo', 'Modelo', 'Serial', 'Data Compra', 'Valor', 'Status', 'Localização'].join(',');
      const rows = assets.map(a => [
        a.id,
        a.tagNumber,
        a.model,
        a.serial,
        a.purchaseDate.toISOString(),
        a.value,
        a.status,
        a.locationId || 'N/A'
      ].join(',')).join('\n');

      const csv = `${header}\n${rows}`;

      c.header('Content-Type', 'text/csv');
      c.header('Content-Disposition', 'attachment; filename=ativos-assetflow.csv');
      return c.body(csv, 200);
    } catch (error) {
      throw error;
    }
  }
}
