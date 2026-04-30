import { describe, it, expect } from 'bun:test';
import { Asset, AssetType, AssetStatus } from './Asset';

describe('Asset Entity', () => {
  const validProps = {
    type: AssetType.HARDWARE,
    tagNumber: 'TAG-12345',
    model: 'Dell XPS 15',
    serial: 'SN-0987654321',
    purchaseDate: new Date(),
    value: 5000.0,
    status: AssetStatus.AVAILABLE,
    companyId: 'company-uuid-123',
  };

  it('should create a valid asset', () => {
    const asset = new Asset(validProps);
    
    expect(asset.id).toBeDefined();
    expect(asset.type).toBe(AssetType.HARDWARE);
    expect(asset.tagNumber).toBe('TAG-12345');
    expect(asset.model).toBe('Dell XPS 15');
    expect(asset.serial).toBe('SN-0987654321');
    expect(asset.status).toBe(AssetStatus.AVAILABLE);
  });

  it('should throw an error if serial number is empty', () => {
    expect(() => {
      new Asset({ ...validProps, serial: '' });
    }).toThrow('O número de série é obrigatório');
  });

  it('should throw an error if tag number is empty', () => {
    expect(() => {
      new Asset({ ...validProps, tagNumber: '' });
    }).toThrow('A etiqueta (Tag) é obrigatória');
  });

  it('should throw an error if company ID is not provided', () => {
    expect(() => {
      new Asset({ ...validProps, companyId: '' });
    }).toThrow('O ID da empresa é obrigatório');
  });

  it('should throw an error if value is negative', () => {
    expect(() => {
      new Asset({ ...validProps, value: -100 });
    }).toThrow('O valor não pode ser negativo');
  });

  it('should update status', () => {
    const asset = new Asset(validProps);
    asset.updateStatus(AssetStatus.IN_USE);
    expect(asset.status).toBe(AssetStatus.IN_USE);
  });
});
