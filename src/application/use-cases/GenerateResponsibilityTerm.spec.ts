import { describe, it, expect, mock } from 'bun:test';
import { GenerateResponsibilityTerm } from './GenerateResponsibilityTerm';

const mockFindAssetById = mock();
const mockFindActiveAssignment = mock();
const mockFindUserById = mock();

const mockAssetRepository: any = { findById: mockFindAssetById };
const mockAssignmentRepository: any = { findActiveByAssetId: mockFindActiveAssignment };
const mockUserRepository: any = { findById: mockFindUserById };

mock.module('pdfkit', () => ({
  default: class PDFDocument {
    on(event: string, callback: any) {
      if (event === 'end') callback();
      if (event === 'data') callback(Buffer.from('mock-pdf'));
    }
    fontSize() { return this; }
    text() { return this; }
    font() { return this; }
    moveDown() { return this; }
    end() { }
  }
}));

describe('GenerateResponsibilityTerm Use Case', () => {
  it('should generate a PDF buffer successfully', async () => {
    mockFindAssetById.mockResolvedValue({ type: 'LAPTOP', model: 'M', serial: 'S', tagNumber: 'T' });
    mockFindActiveAssignment.mockResolvedValue({ userId: 'u1', assignedAt: new Date() });
    mockFindUserById.mockResolvedValue({ name: 'John' });

    const useCase = new GenerateResponsibilityTerm(mockAssetRepository, mockAssignmentRepository, mockUserRepository);
    const buffer = await useCase.execute('asset1');
    
    expect(buffer).toBeInstanceOf(Buffer);
  });

  it('should throw if asset not found', async () => {
    mockFindAssetById.mockResolvedValue(null);
    const useCase = new GenerateResponsibilityTerm(mockAssetRepository, mockAssignmentRepository, mockUserRepository);
    await expect(useCase.execute('asset1')).rejects.toThrow('Ativo não encontrado');
  });

  it('should throw if active assignment not found', async () => {
    mockFindAssetById.mockResolvedValue({ type: 'LAPTOP' });
    mockFindActiveAssignment.mockResolvedValue(null);
    const useCase = new GenerateResponsibilityTerm(mockAssetRepository, mockAssignmentRepository, mockUserRepository);
    await expect(useCase.execute('asset1')).rejects.toThrow('Nenhuma atribuição ativa encontrada');
  });

  it('should throw if user not found', async () => {
    mockFindAssetById.mockResolvedValue({ type: 'LAPTOP' });
    mockFindActiveAssignment.mockResolvedValue({ userId: 'u1' });
    mockFindUserById.mockResolvedValue(null);
    const useCase = new GenerateResponsibilityTerm(mockAssetRepository, mockAssignmentRepository, mockUserRepository);
    await expect(useCase.execute('asset1')).rejects.toThrow('Usuário atribuído não encontrado');
  });
});
