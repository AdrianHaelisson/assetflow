import { describe, it, expect, mock, beforeEach } from 'bun:test';

const mockFindMany = mock();
const mockCreate = mock();
const mockFindUnique = mock();
const mockUpdate = mock();
const mockCreateAssignment = mock();

mock.module('../../database/prisma', () => ({
  prisma: {
    license: {
      findMany: mockFindMany,
      create: mockCreate,
      findUnique: mockFindUnique,
      update: mockUpdate
    },
    licenseAssignment: {
      create: mockCreateAssignment
    }
  }
}));

describe('LicenseController', () => {
  let c: any;
  let LicenseController: any;

  import('bun:test').then(({ beforeAll }) => {
    beforeAll(async () => {
      LicenseController = (await import('./LicenseController')).LicenseController;
    });
  });

  beforeEach(() => {
    c = {
      get: mock().mockReturnValue({ companyId: 'c1' }),
      json: mock(),
      req: {
        json: mock(),
        param: mock()
      }
    };
    mockFindMany.mockClear();
    mockCreate.mockClear();
    mockFindUnique.mockClear();
    mockUpdate.mockClear();
    mockCreateAssignment.mockClear();
  });

  it('should list licenses', async () => {
    mockFindMany.mockResolvedValue([{ id: 'l1', name: 'Windows' }]);
    await LicenseController.list(c);
    expect(mockFindMany).toHaveBeenCalledWith({ where: { companyId: 'c1' }, include: { assignments: true } });
    expect(c.json).toHaveBeenCalledWith([{ id: 'l1', name: 'Windows' }], 200);
  });

  it('should create a license', async () => {
    c.req.json.mockResolvedValue({ name: 'Windows', totalSeats: 10, isPerpetual: true });
    mockCreate.mockResolvedValue({ id: 'l1' });
    
    await LicenseController.create(c);
    expect(mockCreate).toHaveBeenCalled();
    expect(c.json).toHaveBeenCalledWith({ id: 'l1' }, 201);
  });

  it('should assign a license if seats are available', async () => {
    c.req.param.mockReturnValue({ id: 'l1' });
    c.req.json.mockResolvedValue({ userId: 'u1' });
    
    mockFindUnique.mockResolvedValue({ id: 'l1', totalSeats: 2, assignments: [] });
    mockCreateAssignment.mockResolvedValue({ id: 'a1' });

    await LicenseController.assign(c);
    expect(mockCreateAssignment).toHaveBeenCalled();
    expect(c.json).toHaveBeenCalledWith({ id: 'a1' }, 200);
  });

  it('should throw if no seats available', async () => {
    c.req.param.mockReturnValue({ id: 'l1' });
    c.req.json.mockResolvedValue({ userId: 'u1' });
    
    mockFindUnique.mockResolvedValue({ id: 'l1', totalSeats: 1, assignments: [{ returnedAt: null }] });

    await expect(LicenseController.assign(c)).rejects.toThrow('Não há assentos disponíveis para esta licença');
  });

  it('should update a license', async () => {
    c.req.param.mockReturnValue({ id: 'l1' });
    c.req.json.mockResolvedValue({ name: 'Windows 11' });
    mockUpdate.mockResolvedValue({ id: 'l1', name: 'Windows 11' });

    await LicenseController.update(c);
    expect(mockUpdate).toHaveBeenCalled();
    expect(c.json).toHaveBeenCalledWith({ id: 'l1', name: 'Windows 11' }, 200);
  });
});
