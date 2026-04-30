import { Asset } from '../entities/Asset';

export interface AssetRepository {
  save(asset: Asset): Promise<void>;
  findById(id: string): Promise<Asset | null>;
  findByTagNumber(tagNumber: string): Promise<Asset | null>;
  findAllByCompanyId(companyId: string): Promise<Asset[]>;
  update(asset: Asset): Promise<void>;
  delete(id: string): Promise<void>;
}
