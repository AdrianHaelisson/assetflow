import { describe, it, expect } from 'bun:test';
import { Assignment } from './Assignment';

describe('Assignment Entity', () => {
  const validProps = {
    assetId: 'asset-uuid-123',
    userId: 'user-uuid-123',
  };

  it('should create a valid assignment', () => {
    const assignment = new Assignment(validProps);
    
    expect(assignment.id).toBeDefined();
    expect(assignment.assetId).toBe('asset-uuid-123');
    expect(assignment.userId).toBe('user-uuid-123');
    expect(assignment.assignedAt).toBeInstanceOf(Date);
    expect(assignment.returnedAt).toBeNull();
  });

  it('should throw an error if asset ID is missing', () => {
    expect(() => {
      new Assignment({ ...validProps, assetId: '' });
    }).toThrow('ID do ativo é obrigatório');
  });

  it('should throw an error if user ID is missing', () => {
    expect(() => {
      new Assignment({ ...validProps, userId: '' });
    }).toThrow('O ID do usuário é obrigatório');
  });

  it('should allow returning an asset', () => {
    const assignment = new Assignment(validProps);
    const returnDate = new Date();
    
    assignment.returnAsset(returnDate);
    
    expect(assignment.returnedAt).toBe(returnDate);
  });

  it('should throw an error if trying to return an already returned asset', () => {
    const assignment = new Assignment(validProps);
    assignment.returnAsset(new Date());
    
    expect(() => {
      assignment.returnAsset(new Date());
    }).toThrow('O ativo já foi devolvido');
  });

  it('should throw an error if return date is earlier than assignment date', () => {
    const assignedAt = new Date('2023-01-02');
    const assignment = new Assignment({ ...validProps, assignedAt });
    
    expect(() => {
      assignment.returnAsset(new Date('2023-01-01'));
    }).toThrow('A data de devolução não pode ser anterior à data de atribuição');
  });
});
