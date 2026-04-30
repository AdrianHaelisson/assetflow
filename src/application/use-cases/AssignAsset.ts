import { Assignment } from '../../domain/entities/Assignment';
import { AssetStatus } from '../../domain/entities/Asset';
import { AssignmentRepository } from '../../domain/repositories/AssignmentRepository';
import { AssetRepository } from '../../domain/repositories/AssetRepository';

export interface AssignAssetDTO {
  assetId: string;
  userId: string;
}

export class AssignAsset {
  constructor(
    private assignmentRepository: AssignmentRepository,
    private assetRepository: AssetRepository
  ) {}

  async execute(dto: AssignAssetDTO): Promise<Assignment> {
    const asset = await this.assetRepository.findById(dto.assetId);
    if (!asset) {
      throw new Error('Ativo não encontrado');
    }

    if (asset.status !== AssetStatus.AVAILABLE) {
      throw new Error('O ativo não está disponível para atribuição');
    }

    const assignment = new Assignment({
      assetId: dto.assetId,
      userId: dto.userId,
    });

    asset.updateStatus(AssetStatus.IN_USE);

    // Ideally use a transaction, but we keep it simple for now
    await this.assignmentRepository.save(assignment);
    await this.assetRepository.update(asset);

    return assignment;
  }
}
