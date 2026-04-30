import { Asset, AssetType, AssetStatus } from '../../domain/entities/Asset';
import { AssetRepository } from '../../domain/repositories/AssetRepository';

export interface CreateAssetDTO {
  type: AssetType;
  tagNumber: string;
  model: string;
  serial: string;
  purchaseDate: Date;
  value: number;
  companyId: string;
}

export class CreateAsset {
  constructor(private assetRepository: AssetRepository) {}

  async execute(dto: CreateAssetDTO): Promise<Asset> {
    const existingAsset = await this.assetRepository.findByTagNumber(dto.tagNumber);
    if (existingAsset) {
      throw new Error('Já existe um ativo com esta etiqueta');
    }

    const asset = new Asset({
      ...dto,
      status: AssetStatus.AVAILABLE,
    });

    await this.assetRepository.save(asset);

    return asset;
  }
}
