import { describe, it, expect } from 'bun:test';
import { Company } from './Company';

describe('Company Entity', () => {
  it('should create a valid company', () => {
    const company = new Company({
      name: 'Exatas Contabilidade',
      cnpj: '12.345.678/0001-95', // Usually we pass valid without mask or with, CNPJValidator should handle both
      address: 'Rua Principal, 123',
    });

    expect(company.id).toBeDefined();
    expect(company.name).toBe('Exatas Contabilidade');
    expect(company.cnpj).toBe('12.345.678/0001-95');
    expect(company.address).toBe('Rua Principal, 123');
    expect(company.createdAt).toBeInstanceOf(Date);
  });

  it('should throw an error if name is empty', () => {
    expect(() => {
      new Company({
        name: '',
        cnpj: '12.345.678/0001-95',
        address: 'Rua Principal, 123',
      });
    }).toThrow('O nome é obrigatório');
  });

  it('should throw an error if CNPJ is empty', () => {
    expect(() => {
      new Company({
        name: 'Exatas Contabilidade',
        cnpj: '',
        address: 'Rua Principal, 123',
      });
    }).toThrow('O CNPJ é obrigatório');
  });

  it('should throw an error if CNPJ is invalid', () => {
    expect(() => {
      new Company({
        name: 'Exatas Contabilidade',
        cnpj: '11.111.111/1111-11', // Invalid
        address: 'Rua Principal, 123',
      });
    }).toThrow('CNPJ inválido');
  });
  
  it('should generate a UUID if id is not provided', () => {
      const company = new Company({
          name: 'Tech Corp',
          cnpj: '12.345.678/0001-95',
          address: 'Av Paulista',
      });
      // The generated ID should be a 36-char string
      expect(typeof company.id).toBe('string');
      expect(company.id.length).toBe(36);
  });
});
