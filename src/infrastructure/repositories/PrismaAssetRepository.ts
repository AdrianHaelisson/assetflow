import { AssetRepository } from '../../domain/repositories/AssetRepository';
import { Asset, AssetType, AssetStatus } from '../../domain/entities/Asset';
import { prisma } from '../database/prisma';

export class PrismaAssetRepository implements AssetRepository {
  async save(asset: Asset): Promise<void> {
    await prisma.asset.create({
      data: {
        id: asset.id,
        type: asset.type,
        tagNumber: asset.tagNumber,
        model: asset.model,
        serial: asset.serial,
        purchaseDate: asset.purchaseDate,
        value: asset.value,
        status: asset.status,
        companyId: asset.companyId,
        locationId: asset.locationId || null,
        departmentId: asset.departmentId || null,
        depreciationMonths: asset.depreciationMonths,
      },
    });
  }

  async findById(id: string): Promise<Asset | null> {
    const raw = await prisma.asset.findUnique({
      where: { id, deletedAt: null } as any, // casting because type might not be updated in IDE yet
    });
    if (!raw || raw.deletedAt) return null;

    return new Asset({
      id: raw.id,
      type: raw.type as AssetType,
      tagNumber: raw.tagNumber,
      model: raw.model,
      serial: raw.serial,
      purchaseDate: raw.purchaseDate,
      value: raw.value,
      status: raw.status as AssetStatus,
      companyId: raw.companyId,
      locationId: raw.locationId,
      depreciationMonths: raw.depreciationMonths,
    });
  }

  async findByTagNumber(tagNumber: string): Promise<Asset | null> {
    const raw = await prisma.asset.findUnique({
      where: { tagNumber, deletedAt: null } as any,
    });
    if (!raw || raw.deletedAt) return null;

    return new Asset({
      id: raw.id,
      type: raw.type as AssetType,
      tagNumber: raw.tagNumber,
      model: raw.model,
      serial: raw.serial,
      purchaseDate: raw.purchaseDate,
      value: raw.value,
      status: raw.status as AssetStatus,
      companyId: raw.companyId,
      locationId: raw.locationId,
      depreciationMonths: raw.depreciationMonths,
    });
  }

  async findAllByCompanyId(companyId: string): Promise<Asset[]> {
    const rawList = await prisma.asset.findMany({
      where: { companyId, deletedAt: null } as any,
    });
    return rawList.map(raw => new Asset({
      id: raw.id,
      type: raw.type as AssetType,
      tagNumber: raw.tagNumber,
      model: raw.model,
      serial: raw.serial,
      purchaseDate: raw.purchaseDate,
      value: raw.value,
      status: raw.status as AssetStatus,
      companyId: raw.companyId,
      locationId: raw.locationId,
      depreciationMonths: raw.depreciationMonths,
    }));
  }

  async update(asset: Asset): Promise<void> {
    await prisma.asset.update({
      where: { id: asset.id },
      data: {
        type: asset.type,
        tagNumber: asset.tagNumber,
        model: asset.model,
        serial: asset.serial,
        purchaseDate: asset.purchaseDate,
        value: asset.value,
        status: asset.status,
        locationId: asset.locationId || null,
        departmentId: asset.departmentId || null,
        depreciationMonths: asset.depreciationMonths,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.asset.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
