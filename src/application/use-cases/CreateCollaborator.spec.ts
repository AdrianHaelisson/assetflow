import { describe, it, expect, mock } from 'bun:test';
import { CreateCollaborator } from './CreateCollaborator';

const mockSave = mock();
const mockFindByEmail = mock();
const mockUserRepository: any = { save: mockSave, findByEmail: mockFindByEmail };

describe('CreateCollaborator Use Case', () => {
  it('should create a collaborator successfully', async () => {
    mockFindByEmail.mockResolvedValue(null);
    const useCase = new CreateCollaborator(mockUserRepository);
    const result = await useCase.execute({ name: 'Jon Doe', email: 'jon@example.com', companyId: 'c1' });
    
    expect(mockSave).toHaveBeenCalled();
    expect(result.id).toBeDefined();
    expect(result.name).toBe('Jon Doe');
    expect(result.email).toBe('jon@example.com');
    expect(result.role).toBe('CLIENT' as any);
  });

  it('should throw if email exists', async () => {
    mockFindByEmail.mockResolvedValue({ id: '123' });
    const useCase = new CreateCollaborator(mockUserRepository);
    
    await expect(useCase.execute({ name: 'Jon Doe', email: 'jon@example.com', companyId: 'c1' }))
      .rejects.toThrow('Já existe um usuário com este e-mail');
  });
});
