import { describe, it, expect, mock, beforeEach } from 'bun:test';

const mockExecute = mock();
mock.module('../../../application/use-cases/GenerateDashboardReport', () => ({
  GenerateDashboardReport: mock().mockImplementation(() => ({ execute: mockExecute }))
}));

const mockFindAllByCompanyId = mock();
mock.module('../../repositories/PrismaAssetRepository', () => ({
  PrismaAssetRepository: mock().mockImplementation(() => ({ findAllByCompanyId: mockFindAllByCompanyId }))
}));

describe('ReportController', () => {
  let c: any;
  let ReportController: any;

  import('bun:test').then(({ beforeAll }) => {
    beforeAll(async () => {
      ReportController = (await import('./ReportController')).ReportController;
    });
  });

  beforeEach(() => {
    c = {
      get: mock().mockReturnValue({ companyId: 'c1' }),
      json: mock(),
      header: mock(),
      body: mock()
    };
    mockExecute.mockClear();
    mockFindAllByCompanyId.mockClear();
  });

  it('should return dashboard report', async () => {
    mockExecute.mockResolvedValue({ totalAssets: 10 });
    await ReportController.getDashboardReport(c);
    
    expect(mockExecute).toHaveBeenCalledWith({ companyId: 'c1' });
    expect(c.json).toHaveBeenCalledWith({ totalAssets: 10 }, 200);
  });

  it('should export assets CSV', async () => {
    mockFindAllByCompanyId.mockResolvedValue([
      { id: '1', tagNumber: 'T1', model: 'M', serial: 'S', purchaseDate: new Date('2023-01-01'), value: 100, status: 'AVAILABLE', locationId: null }
    ]);

    await ReportController.exportAssetsCSV(c);

    expect(mockFindAllByCompanyId).toHaveBeenCalledWith('c1');
    expect(c.header).toHaveBeenCalledWith('Content-Type', 'text/csv');
    expect(c.header).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=ativos-assetflow.csv');
    expect(c.body).toHaveBeenCalled();
  });
});
