import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { PrismaAssetRepository } from './PrismaAssetRepository';
import { Asset, AssetType, AssetStatus } from '../../domain/entities/Asset';
import { prisma } from '../database/prisma';

mock.module('../database/prisma', () => ({
    prisma: {
        asset: {
            create: mock(),
            findUnique: mock(),
            findMany: mock(),
            update: mock(),
        }
    }
}));

describe('PrismaAssetRepository', () => {
    let repository: PrismaAssetRepository;

    beforeEach(() => {
        repository = new PrismaAssetRepository();
        mock.restore();
    });

    it('should save an asset', async () => {
        const asset = new Asset({
            type: AssetType.HARDWARE,
            tagNumber: 'TAG-123',
            model: 'Dell',
            serial: '123',
            purchaseDate: new Date(),
            value: 1000,
            status: AssetStatus.AVAILABLE,
            companyId: 'comp-1'
        });

        await repository.save(asset);

        expect(prisma.asset.create).toHaveBeenCalledWith({
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
                locationId: null,
                departmentId: null,
                depreciationMonths: 36,
            }
        });
    });

    it('should find asset by id', async () => {
        (prisma.asset.findUnique as any).mockResolvedValue({
            id: '123',
            type: 'LAPTOP',
            tagNumber: 'TAG-123',
            model: 'Dell',
            serial: '123',
            purchaseDate: new Date(),
            value: 1000,
            status: 'AVAILABLE',
            companyId: 'comp-1'
        } as any);

        const asset = await repository.findById('123');
        expect(asset).toBeInstanceOf(Asset);
        expect(asset!.id).toBe('123');
    });

    it('should return null if not found by id', async () => {
        (prisma.asset.findUnique as any).mockResolvedValue(null);
        const asset = await repository.findById('123');
        expect(asset).toBeNull();
    });

    it('should find all by companyId', async () => {
        (prisma.asset.findMany as any).mockResolvedValue([
            { id: '123', type: 'LAPTOP', status: 'AVAILABLE', companyId: 'comp-1', serial: 'serial-1', tagNumber: 'tag-1' }
        ] as any);

        const assets = await repository.findAllByCompanyId('comp-1');
        expect(assets).toHaveLength(1);
        expect(assets[0]).toBeInstanceOf(Asset);
    });

    it('should update asset status', async () => {
        const asset = new Asset({
            id: '123',
            type: AssetType.HARDWARE,
            tagNumber: 'TAG-123',
            model: 'Dell',
            serial: '123',
            purchaseDate: new Date(),
            value: 1000,
            status: AssetStatus.IN_USE,
            companyId: 'comp-1'
        });

        await repository.update(asset);

        expect(prisma.asset.update).toHaveBeenCalledWith({
            where: { id: '123' },
            data: { 
                type: asset.type,
                tagNumber: asset.tagNumber,
                model: asset.model,
                serial: asset.serial,
                purchaseDate: asset.purchaseDate,
                value: asset.value,
                status: AssetStatus.IN_USE,
                locationId: null,
                departmentId: null,
                depreciationMonths: 36
            }
        });
    });
});
