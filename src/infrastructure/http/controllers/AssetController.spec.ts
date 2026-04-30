import { describe, it, expect, mock, beforeEach } from 'bun:test';

mock.module('../../../application/use-cases/CreateAsset', () => ({
    CreateAsset: mock().mockImplementation(function() {
        return { execute: mock().mockResolvedValue({ id: 'mock-id', tagNumber: 'TAG-123' }) };
    })
}));

mock.module('../../../application/use-cases/AssignAsset', () => ({
    AssignAsset: mock().mockImplementation(function() {
        return { execute: mock().mockResolvedValue({ id: 'assignment-id', assetId: 'mock-id', userId: 'user-id' }) };
    })
}));

mock.module('../../../application/use-cases/GenerateResponsibilityTerm', () => ({
    GenerateResponsibilityTerm: mock().mockImplementation(function() {
        return { execute: mock().mockResolvedValue(Buffer.from('PDF_MOCK')) };
    })
}));

const mockFindAllByCompanyId = mock().mockResolvedValue([{ 
        id: 'asset1',
        type: 'LAPTOP',
        tagNumber: 'TAG-1',
        model: 'Model',
        serial: '123',
        purchaseDate: new Date(),
        value: 1000,
        status: 'AVAILABLE',
        companyId: 'comp1',
        locationId: null,
        currentValue: mock().mockReturnValue(1000)
    }, {
        id: 'asset2',
        type: 'LAPTOP',
        tagNumber: 'TAG-2',
        model: 'Model',
        serial: '124',
        purchaseDate: new Date(),
        value: 2000,
        status: 'IN_USE',
        companyId: 'comp1',
        locationId: null,
        currentValue: mock().mockReturnValue(2000)
    }]);

const mockFindById = mock().mockResolvedValue({
    id: 'asset1', type: 'LAPTOP', tagNumber: 'TAG-1', model: 'Model', serial: '123', purchaseDate: new Date(), value: 1000, status: 'AVAILABLE', companyId: 'comp1'
});

const mockUpdate = mock().mockResolvedValue(undefined);
const mockDelete = mock().mockResolvedValue(undefined);

mock.module('../../repositories/PrismaAssetRepository', () => ({
    PrismaAssetRepository: mock().mockImplementation(function() {
        return { 
            findAllByCompanyId: mockFindAllByCompanyId,
            findById: mockFindById,
            update: mockUpdate,
            delete: mockDelete
        };
    })
}));

const mockFindAllByAssetId = mock().mockResolvedValue([{ id: 'assig1' }]);

mock.module('../../repositories/PrismaAssignmentRepository', () => ({
    PrismaAssignmentRepository: mock().mockImplementation(function() { 
        return { findAllByAssetId: mockFindAllByAssetId }; 
    })
}));

mock.module('../../repositories/PrismaUserRepository', () => ({
    PrismaUserRepository: mock().mockImplementation(function() { return {}; })
}));

const mockSystemLogCreate = mock().mockResolvedValue(undefined);
mock.module('../../database/prisma', () => ({
    prisma: { systemLog: { create: mockSystemLogCreate } }
}));

describe('AssetController', () => {
    let c: any;
    let AssetController: any;

    import('bun:test').then(({ beforeAll }) => {
        beforeAll(async () => {
            AssetController = (await import('./AssetController')).AssetController;
        });
    });

    beforeEach(() => {
        c = { 
            req: { 
                json: mock(),
                param: mock(),
                query: mock()
            },
            json: mock(),
            body: mock(),
            header: mock(),
            get: mock().mockReturnValue({ id: 'user1', companyId: 'comp1' })
        };
        mockSystemLogCreate.mockClear();
    });

    it('should create an asset successfully', async () => {
        c.req.json.mockResolvedValue({ tagNumber: 'TAG-123' });
        await AssetController.create(c);
        expect(c.json).toHaveBeenCalledWith({ id: 'mock-id', tagNumber: 'TAG-123' }, 201);
    });

    it('should assign an asset successfully', async () => {
        c.req.param.mockReturnValue('asset-1');
        c.req.json.mockResolvedValue({ userId: 'user-1' });
        await AssetController.assign(c);
        expect(c.json).toHaveBeenCalledWith({ id: 'assignment-id', assetId: 'mock-id', userId: 'user-id' }, 200);
    });

    it('should list assets properly', async () => {
        c.req.query.mockReturnValue('comp1');
        await AssetController.list(c);
        expect(mockFindAllByCompanyId).toHaveBeenCalledWith('comp1');
        expect(c.json).toHaveBeenCalled();
    });

    it('should get asset history', async () => {
        c.req.param.mockReturnValue('asset1');
        await AssetController.getHistory(c);
        expect(c.json).toHaveBeenCalledWith([{ id: 'assig1' }], 200);
    });

    it('should get asset responsibility term pdf', async () => {
        c.req.param.mockReturnValue('asset1');
        await AssetController.getTerm(c);
        expect(c.header).toHaveBeenCalledWith('Content-Type', 'application/pdf');
        expect(c.body).toHaveBeenCalled();
    });

    it('should calculate stats properly', async () => {
        c.req.query.mockReturnValue('comp1');
        await AssetController.getStats(c);
        expect(c.json).toHaveBeenCalledWith({
            total: 2,
            inUse: 1,
            available: 1,
            maintenance: 0,
            retired: 0,
            totalValue: 3000,
            statusDistribution: [
                { status: 'AVAILABLE', count: 1 },
                { status: 'IN_USE', count: 1 }
            ]
        }, 200);
    });

    it('should delete an asset and log it', async () => {
        c.req.param.mockReturnValue({ id: 'asset1' });
        await AssetController.delete(c);
        expect(mockDelete).toHaveBeenCalledWith('asset1');
        expect(mockSystemLogCreate).toHaveBeenCalled();
        expect(c.body).toHaveBeenCalledWith(null, 204);
    });

    it('should update an asset and log it', async () => {
        c.req.param.mockReturnValue({ id: 'asset1' });
        c.req.json.mockResolvedValue({ status: 'MAINTENANCE' });
        await AssetController.update(c);
        expect(mockUpdate).toHaveBeenCalled();
        expect(mockSystemLogCreate).toHaveBeenCalled();
        expect(c.json).toHaveBeenCalled();
    });
});
