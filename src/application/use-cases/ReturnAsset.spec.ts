import { describe, it, expect, mock } from 'bun:test';
import { ReturnAsset } from './ReturnAsset';
import { Asset, AssetType, AssetStatus } from '../../domain/entities/Asset';
import { Assignment } from '../../domain/entities/Assignment';

describe('ReturnAsset Use Case', () => {
    it('should successfully return an asset in use', async () => {
        const mockAsset = new Asset({
            type: AssetType.HARDWARE,
            tagNumber: 'TAG-123',
            model: 'Dell',
            serial: '123',
            purchaseDate: new Date(),
            value: 1000,
            status: AssetStatus.IN_USE,
            companyId: 'comp-1'
        });

        const mockAssignment = new Assignment({
            assetId: mockAsset.id,
            userId: 'user-1'
        });

        const mockAssetRepo = {
            findById: mock().mockResolvedValue(mockAsset),
            update: mock()
        };

        const mockAssignmentRepo = {
            findActiveByAssetId: mock().mockResolvedValue(mockAssignment),
            update: mock()
        };

        const returnAsset = new ReturnAsset(mockAssignmentRepo as any, mockAssetRepo as any);
        
        await returnAsset.execute({ assetId: mockAsset.id });

        expect(mockAsset.status).toBe(AssetStatus.AVAILABLE);
        expect(mockAssignment.returnedAt).toBeInstanceOf(Date);
        
        expect(mockAssetRepo.update).toHaveBeenCalledWith(mockAsset);
        expect(mockAssignmentRepo.update).toHaveBeenCalledWith(mockAssignment);
    });

    it('should throw if asset not found', async () => {
        const mockAssetRepo = { findById: mock().mockResolvedValue(null) };
        const mockAssignmentRepo = {};

        const returnAsset = new ReturnAsset(mockAssignmentRepo as any, mockAssetRepo as any);
        
        await expect(returnAsset.execute({ assetId: '123' }))
            .rejects.toThrow('Ativo não encontrado');
    });

    it('should throw if asset is not in use', async () => {
        const mockAsset = new Asset({
            type: AssetType.HARDWARE,
            tagNumber: 'TAG-123',
            model: 'Dell',
            serial: '123',
            purchaseDate: new Date(),
            value: 1000,
            status: AssetStatus.AVAILABLE,
            companyId: 'comp-1'
        });

        const mockAssetRepo = { findById: mock().mockResolvedValue(mockAsset) };
        const mockAssignmentRepo = {};

        const returnAsset = new ReturnAsset(mockAssignmentRepo as any, mockAssetRepo as any);
        
        await expect(returnAsset.execute({ assetId: mockAsset.id }))
            .rejects.toThrow('O ativo não está em uso no momento');
    });

    it('should throw if no active assignment found', async () => {
        const mockAsset = new Asset({
            type: AssetType.HARDWARE,
            tagNumber: 'TAG-123',
            model: 'Dell',
            serial: '123',
            purchaseDate: new Date(),
            value: 1000,
            status: AssetStatus.IN_USE,
            companyId: 'comp-1'
        });

        const mockAssetRepo = { findById: mock().mockResolvedValue(mockAsset) };
        const mockAssignmentRepo = { findActiveByAssetId: mock().mockResolvedValue(null) };

        const returnAsset = new ReturnAsset(mockAssignmentRepo as any, mockAssetRepo as any);
        
        await expect(returnAsset.execute({ assetId: mockAsset.id }))
            .rejects.toThrow('Atribuição ativa não encontrada');
    });
});
