import { describe, it, expect, mock } from 'bun:test';
import { GenerateDashboardReport } from './GenerateDashboardReport';

const mockFindAll = mock();
const mockAssetRepository: any = { findAllByCompanyId: mockFindAll };

describe('GenerateDashboardReport Use Case', () => {
  it('should generate report stats correctly', async () => {
    mockFindAll.mockResolvedValue([
      { status: 'AVAILABLE', value: 1000, currentValue: () => 800 },
      { status: 'IN_USE', value: 2000, currentValue: () => 1500 },
      { status: 'AVAILABLE', value: 500, currentValue: () => 400 },
    ]);
    
    const useCase = new GenerateDashboardReport(mockAssetRepository);
    const result = await useCase.execute({ companyId: 'c1' });
    
    expect(mockFindAll).toHaveBeenCalledWith('c1');
    expect(result.totalAssets).toBe(3);
    expect(result.assetsAvailable).toBe(2);
    expect(result.assetsInUse).toBe(1);
    expect(result.totalAcquisitionValue).toBe(3500);
    expect(result.totalCurrentValue).toBe(2700);
  });

  it('should return zeros for empty assets', async () => {
    mockFindAll.mockResolvedValue([]);
    
    const useCase = new GenerateDashboardReport(mockAssetRepository);
    const result = await useCase.execute({ companyId: 'c1' });
    
    expect(result.totalAssets).toBe(0);
    expect(result.assetsAvailable).toBe(0);
    expect(result.assetsInUse).toBe(0);
    expect(result.totalAcquisitionValue).toBe(0);
    expect(result.totalCurrentValue).toBe(0);
  });
});
