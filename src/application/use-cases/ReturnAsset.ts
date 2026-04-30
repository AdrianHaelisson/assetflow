import { AssetStatus } from '../../domain/entities/Asset';
import { AssignmentRepository } from '../../domain/repositories/AssignmentRepository';
import { AssetRepository } from '../../domain/repositories/AssetRepository';

export interface ReturnAssetDTO {
  assetId: string;
}

export class ReturnAsset {
  constructor(
    private assignmentRepository: AssignmentRepository,
    private assetRepository: AssetRepository
  ) {}

  async execute(dto: ReturnAssetDTO): Promise<void> {
    const asset = await this.assetRepository.findById(dto.assetId);
    if (!asset) {
      throw new Error('Ativo não encontrado');
    }

    if (asset.status !== AssetStatus.IN_USE) {
      throw new Error('O ativo não está em uso no momento');
    }

    const assignment = await this.assignmentRepository.findActiveByAssetId(dto.assetId);
    if (!assignment) {
      throw new Error('Atribuição ativa não encontrada');
    }

    assignment.returnAsset(new Date());
    asset.updateStatus(AssetStatus.AVAILABLE);

    await this.assignmentRepository.update(assignment);
    await this.assetRepository.update(asset);
  }
}
