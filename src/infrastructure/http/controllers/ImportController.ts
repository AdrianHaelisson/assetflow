import { Context } from 'hono';
import { prisma } from '../../database/prisma';
import csv from 'csv-parser';
import { Readable } from 'stream';

export class ImportController {
  static async importCSV(c: Context) {
    try {
      const body = await c.req.parseBody();
      const file = body['file'] as File;
      if (!file) throw new Error('Nenhum arquivo enviado');
      
      const companyId = c.get('user')?.companyId as string;
      const results: any[] = [];
      const text = await file.text();
      const stream = Readable.from(text);

      return await new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', async () => {
             try {
               let imported = 0;
               for (const row of results) {
                  if (row.tagNumber && row.serial && row.model) {
                     await prisma.asset.create({
                        data: {
                           type: row.type || 'HARDWARE',
                           tagNumber: row.tagNumber,
                           model: row.model,
                           serial: row.serial,
                           purchaseDate: row.purchaseDate ? new Date(row.purchaseDate) : new Date(),
                           value: parseFloat(row.value || '0'),
                           status: row.status || 'AVAILABLE',
                           companyId
                        }
                     });
                     imported++;
                  }
               }
               resolve(c.json({ message: `${imported} ativos importados com sucesso.` }, 200));
             } catch (err) { reject(err); }
          })
          .on('error', reject);
      });
    } catch (e) {
      throw e;
    }
  }
}