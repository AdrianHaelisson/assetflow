import { describe, it, expect, mock } from 'bun:test';
import { AssignAsset } from './AssignAsset';
import { Asset, AssetType, AssetStatus } from '../../domain/entities/Asset';
import { Assignment } from '../../domain/entities/Assignment';

describe('AssignAsset Use Case', () => {
    it('should successfully assign an available asset', async () => {
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

        const mockAssetRepo = {
            findById: mock().mockResolvedValue(mockAsset),
            update: mock(),
        };

        const mockAssignmentRepo = {
            save: mock(),
        };

        const assignAsset = new AssignAsset(mockAssignmentRepo as any, mockAssetRepo as any);
        
        const assignment = await assignAsset.execute({
            assetId: mockAsset.id,
            userId: 'user-1'
        });

        expect(assignment).toBeInstanceOf(Assignment);
        expect(assignment.userId).toBe('user-1');
        expect(assignment.assetId).toBe(mockAsset.id);
        expect(mockAsset.status).toBe(AssetStatus.IN_USE);
        
        expect(mockAssetRepo.update).toHaveBeenCalledWith(mockAsset);
        expect(mockAssignmentRepo.save).toHaveBeenCalledWith(assignment);
    });

    it('should throw error if asset does not exist', async () => {
        const mockAssetRepo = {
            findById: mock().mockResolvedValue(null)
        };
        const mockAssignmentRepo = { save: mock() };

        const assignAsset = new AssignAsset(mockAssignmentRepo as any, mockAssetRepo as any);
        
        await expect(assignAsset.execute({
            assetId: 'non-existing',
            userId: 'user-1'
        })).rejects.toThrow('Ativo não encontrado');
    });

    it('should throw error if asset is not available', async () => {
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

        const mockAssetRepo = {
            findById: mock().mockResolvedValue(mockAsset),
            update: mock()
        };
        const mockAssignmentRepo = { save: mock() };

        const assignAsset = new AssignAsset(mockAssignmentRepo as any, mockAssetRepo as any);
        
        await expect(assignAsset.execute({
            assetId: mockAsset.id,
            userId: 'user-1'
        })).rejects.toThrow('O ativo não está disponível para atribuição');
    });
});
