import PDFDocument from 'pdfkit';
import { Asset } from '../../domain/entities/Asset';
import { Assignment } from '../../domain/entities/Assignment';

export class PDFGenerator {
  static generateResponsibilityTerm(asset: Asset, assignment: Assignment, userName: string): Buffer {
    const doc = new PDFDocument();
    const buffers: any[] = [];
    
    doc.on('data', buffers.push.bind(buffers));
    
    doc.fontSize(20).text('Termo de Responsabilidade', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Declaro ter recebido o equipamento abaixo especificado:`);
    doc.moveDown();
    
    doc.text(`Tipo: ${asset.type}`);
    doc.text(`Modelo: ${asset.model}`);
    doc.text(`Patrimônio/Tag: ${asset.tagNumber}`);
    doc.text(`Número de Série: ${asset.serial}`);
    doc.text(`Data de Empréstimo: ${assignment.assignedAt.toLocaleDateString()}`);
    
    doc.moveDown(2);
    
    doc.text(`Responsável: ${userName}`);
    
    doc.moveDown(4);
    doc.text(`_________________________________________________`, { align: 'center' });
    doc.text(`Assinatura do Responsável`, { align: 'center' });
    
    doc.end();
    
    return Buffer.concat(buffers);
  }
}
