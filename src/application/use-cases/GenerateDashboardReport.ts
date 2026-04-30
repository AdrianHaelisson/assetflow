import { AssetRepository } from '../../domain/repositories/AssetRepository';
import { AssetStatus } from '../../domain/entities/Asset';

export interface DashboardReportDTO {
  totalAssets: number;
  assetsAvailable: number;
  assetsInUse: number;
  totalAcquisitionValue: number;
  totalCurrentValue: number;
}

export class GenerateDashboardReport {
  constructor(private assetRepository: AssetRepository) {}

  async execute({ companyId }: { companyId: string }): Promise<DashboardReportDTO> {
    const assets = await this.assetRepository.findAllByCompanyId(companyId);
    
    let availableCount = 0;
    let inUseCount = 0;
    let totalAcquisitionValue = 0;
    let totalCurrentValue = 0;

    for (const asset of assets) {
      totalAcquisitionValue += asset.value;
      totalCurrentValue += asset.currentValue();

      if (asset.status === AssetStatus.AVAILABLE) {
        availableCount++;
      } else if (asset.status === AssetStatus.IN_USE) {
        inUseCount++;
      }
    }

    return {
      totalAssets: assets.length,
      assetsAvailable: availableCount,
      assetsInUse: inUseCount,
      totalAcquisitionValue: parseFloat(totalAcquisitionValue.toFixed(2)),
      totalCurrentValue: parseFloat(totalCurrentValue.toFixed(2)),
      currentDepreciatedValue: parseFloat(totalCurrentValue.toFixed(2)), // For frontend compatibility
      statusDistribution: {
        AVAILABLE: availableCount,
        IN_USE: inUseCount,
        MAINTENANCE: assets.filter(a => a.status === AssetStatus.MAINTENANCE).length,
        RETIRED: assets.filter(a => a.status === AssetStatus.RETIRED).length
      }
    };
  }
}
