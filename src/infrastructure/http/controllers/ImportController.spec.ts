import { describe, it, expect, mock, beforeEach } from 'bun:test';

const mockAssetCreate = mock();
mock.module('../../database/prisma', () => ({
  prisma: { asset: { create: mockAssetCreate } }
}));

describe('ImportController', () => {
  let c: any;
  let ImportController: any;

  import('bun:test').then(({ beforeAll }) => {
    beforeAll(async () => {
      ImportController = (await import('./ImportController')).ImportController;
    });
  });

  beforeEach(() => {
    c = {
      get: mock().mockReturnValue({ companyId: 'c1' }),
      json: mock().mockReturnValue('mock-response'),
      req: {
        parseBody: mock()
      }
    };
    mockAssetCreate.mockClear();
  });

  it('should import CSV and create assets', async () => {
    const csvContent = `tagNumber,serial,model,type,value,status
TAG1,123,Dell,HARDWARE,1000,AVAILABLE
TAG2,124,Mac,HARDWARE,2000,AVAILABLE`;
    
    const mockFile = {
      text: mock().mockResolvedValue(csvContent)
    };
    
    c.req.parseBody.mockResolvedValue({ file: mockFile });

    const result = await ImportController.importCSV(c);
    expect(mockAssetCreate).toHaveBeenCalledTimes(2);
    expect(c.json).toHaveBeenCalledWith({ message: '2 ativos importados com sucesso.' }, 200);
    expect(result).toBe('mock-response');
  });

  it('should throw if no file uploaded', async () => {
    c.req.parseBody.mockResolvedValue({});
    await expect(ImportController.importCSV(c)).rejects.toThrow('Nenhum arquivo enviado');
  });
});
