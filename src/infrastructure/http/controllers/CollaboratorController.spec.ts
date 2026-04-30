import { describe, it, expect, mock, beforeEach } from 'bun:test';

const mockCreateExec = mock();
mock.module('../../../application/use-cases/CreateCollaborator', () => ({
  CreateCollaborator: mock().mockImplementation(() => ({ execute: mockCreateExec }))
}));

const mockListExec = mock();
mock.module('../../../application/use-cases/ListCollaborators', () => ({
  ListCollaborators: mock().mockImplementation(() => ({ execute: mockListExec }))
}));

const mockFindById = mock();
const mockUpdate = mock();
const mockDelete = mock();
mock.module('../../repositories/PrismaUserRepository', () => ({
  PrismaUserRepository: mock().mockImplementation(() => ({
    findById: mockFindById,
    update: mockUpdate,
    delete: mockDelete
  }))
}));

const mockSystemLogCreate = mock();
mock.module('../../database/prisma', () => ({
  prisma: { systemLog: { create: mockSystemLogCreate } }
}));

describe('CollaboratorController', () => {
  let c: any;
  let CollaboratorController: any;

  import('bun:test').then(({ beforeAll }) => {
    beforeAll(async () => {
      CollaboratorController = (await import('./CollaboratorController')).CollaboratorController;
    });
  });

  beforeEach(() => {
    c = {
      get: mock().mockReturnValue({ companyId: 'c1', id: 'admin1' }),
      json: mock(),
      body: mock(),
      req: {
        json: mock(),
        param: mock()
      }
    };
    mockCreateExec.mockClear();
    mockListExec.mockClear();
    mockFindById.mockClear();
    mockUpdate.mockClear();
    mockDelete.mockClear();
    mockSystemLogCreate.mockClear();
  });

  it('should create a collaborator', async () => {
    c.req.json.mockResolvedValue({ name: 'Jon', email: 'j@e.com' });
    mockCreateExec.mockResolvedValue({ id: 'collab1' });

    await CollaboratorController.create(c);

    expect(mockCreateExec).toHaveBeenCalledWith({ name: 'Jon', email: 'j@e.com', companyId: 'c1' });
    expect(c.json).toHaveBeenCalledWith({ id: 'collab1' }, 201);
  });

  it('should list collaborators', async () => {
    mockListExec.mockResolvedValue([{ id: 'collab1' }]);
    await CollaboratorController.list(c);
    expect(mockListExec).toHaveBeenCalledWith({ companyId: 'c1' });
    expect(c.json).toHaveBeenCalledWith([{ id: 'collab1' }], 200);
  });

  it('should update a collaborator and log it', async () => {
    c.req.param.mockReturnValue({ id: 'collab1' });
    c.req.json.mockResolvedValue({ name: 'Jonny' });
    mockFindById.mockResolvedValue({ id: 'collab1', props: {} });
    
    await CollaboratorController.update(c);
    
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSystemLogCreate).toHaveBeenCalled();
    expect(c.json).toHaveBeenCalled();
  });

  it('should delete a collaborator and log it', async () => {
    c.req.param.mockReturnValue({ id: 'collab1' });
    
    await CollaboratorController.delete(c);
    
    expect(mockDelete).toHaveBeenCalledWith('collab1');
    expect(mockSystemLogCreate).toHaveBeenCalled();
    expect(c.body).toHaveBeenCalledWith(null, 204);
  });
});
