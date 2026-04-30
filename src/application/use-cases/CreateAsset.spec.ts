import { describe, it, expect, mock } from 'bun:test';
import { CreateAsset } from './CreateAsset';
import { Asset, AssetType, AssetStatus } from '../../domain/entities/Asset';

describe('CreateAsset Use Case', () => {
    it('should create an asset successfully', async () => {
        const mockRepo = {
            findByTagNumber: mock().mockResolvedValue(null),
            save: mock(),
            findById: mock(),
            findAll: mock(),
            update: mock(),
            delete: mock(),
        };

        const createAsset = new CreateAsset(mockRepo as any);
        const dto = {
            type: AssetType.HARDWARE,
            tagNumber: 'TAG-123',
            model: 'Dell XPS',
            serial: 'SN-1234',
            purchaseDate: new Date('2023-01-01'),
            value: 1500,
            companyId: 'company-1'
        };

        const asset = await createAsset.execute(dto);

        expect(asset).toBeInstanceOf(Asset);
        expect(asset.tagNumber).toBe('TAG-123');
        expect(asset.status).toBe(AssetStatus.AVAILABLE);
        expect(mockRepo.save).toHaveBeenCalled();
        expect(mockRepo.findByTagNumber).toHaveBeenCalledWith('TAG-123');
    });

    it('should throw error if tag number exists', async () => {
        const existingAsset = new Asset({
            type: AssetType.HARDWARE,
            tagNumber: 'TAG-123',
            model: 'Old Dell',
            serial: 'old-serial',
            purchaseDate: new Date(),
            value: 100,
            status: AssetStatus.AVAILABLE,
            companyId: '1'
        });

        const mockRepo = {
            findByTagNumber: mock().mockResolvedValue(existingAsset),
            save: mock(),
            findById: mock(),
            findAll: mock(),
            update: mock(),
            delete: mock(),
        };

        const createAsset = new CreateAsset(mockRepo as any);

        await expect(createAsset.execute({
            type: AssetType.HARDWARE,
            tagNumber: 'TAG-123',
            model: 'New Dell',
            serial: 'new-serial',
            purchaseDate: new Date(),
            value: 1500,
            companyId: 'company-1'
        })).rejects.toThrow('Já existe um ativo com esta etiqueta');
        
        expect(mockRepo.save).not.toHaveBeenCalled();
    });
});
