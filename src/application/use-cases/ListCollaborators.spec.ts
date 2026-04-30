import { describe, it, expect, mock } from 'bun:test';
import { ListCollaborators } from './ListCollaborators';

const mockFindAll = mock();
const mockUserRepository: any = { findAllByCompanyId: mockFindAll };

describe('ListCollaborators Use Case', () => {
  it('should list collaborators successfully', async () => {
    mockFindAll.mockResolvedValue([{ id: '1', name: 'Jon Doe', role: 'CLIENT' }]);
    
    const useCase = new ListCollaborators(mockUserRepository);
    const result = await useCase.execute({ companyId: 'c1' });
    
    expect(mockFindAll).toHaveBeenCalledWith('c1');
    expect(result.length).toBe(1);
    expect((result as any)[0].name).toBe('Jon Doe');
  });
});
