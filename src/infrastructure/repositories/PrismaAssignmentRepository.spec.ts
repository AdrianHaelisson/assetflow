import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { PrismaAssignmentRepository } from './PrismaAssignmentRepository';
import { Assignment } from '../../domain/entities/Assignment';

const mockCreate = mock();
const mockFindUnique = mock();
const mockFindFirst = mock();
const mockFindMany = mock();
const mockUpdate = mock();

mock.module('../database/prisma', () => ({
  prisma: {
    assignment: {
      create: mockCreate,
      findUnique: mockFindUnique,
      findFirst: mockFindFirst,
      findMany: mockFindMany,
      update: mockUpdate,
    }
  }
}));

describe('PrismaAssignmentRepository', () => {
  let repository: PrismaAssignmentRepository;

  beforeEach(() => {
    repository = new PrismaAssignmentRepository();
    mockCreate.mockClear();
    mockFindUnique.mockClear();
    mockFindFirst.mockClear();
    mockFindMany.mockClear();
    mockUpdate.mockClear();
  });

  it('should save an assignment', async () => {
    const assignment = new Assignment({
      id: 'assign1',
      assetId: 'asset1',
      userId: 'user1',
      assignedAt: new Date()
    });

    mockCreate.mockResolvedValue({});
    await repository.save(assignment);

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'assign1',
        assetId: 'asset1',
        userId: 'user1'
      })
    });
  });

  it('should find active assignment by asset Id', async () => {
    mockFindFirst.mockResolvedValue({
      id: 'assign1',
      assetId: 'asset1',
      userId: 'user1',
      assignedAt: new Date(),
      returnedAt: null
    });

    const result = await repository.findActiveByAssetId('asset1');
    expect(result?.id).toBe('assign1');
  });

  it('should return null if no active assignment', async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await repository.findActiveByAssetId('asset1');
    expect(result).toBeNull();
  });

  it('should find assignment by id', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'assign1',
      assetId: 'asset1',
      userId: 'user1',
      assignedAt: new Date(),
      returnedAt: null
    });

    const result = await repository.findById('assign1');
    expect(result?.id).toBe('assign1');
  });

  it('should return null if assignment by id not found', async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await repository.findById('assign1');
    expect(result).toBeNull();
  });

  it('should find all by assetId and map user name', async () => {
    mockFindMany.mockResolvedValue([{
      id: 'assign1',
      assetId: 'asset1',
      userId: 'user1',
      assignedAt: new Date(),
      returnedAt: null,
      user: { name: 'John Doe' }
    }]);

    const results = await repository.findAllByAssetId('asset1');
    expect(results.length).toBe(1);
    expect((results[0] as any).userName).toBe('John Doe');
  });

  it('should update an assignment', async () => {
    const assignment = new Assignment({
      id: 'assign1',
      assetId: 'asset1',
      userId: 'user1',
      assignedAt: new Date(),
      returnedAt: new Date()
    });

    mockUpdate.mockResolvedValue({});
    await repository.update(assignment);

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'assign1' },
      data: expect.objectContaining({
        returnedAt: expect.any(Date)
      })
    });
  });
});
