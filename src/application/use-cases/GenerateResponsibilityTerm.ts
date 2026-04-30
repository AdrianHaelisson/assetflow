import PDFDocument from 'pdfkit';
import { AssetRepository } from '../../domain/repositories/AssetRepository';
import { AssignmentRepository } from '../../domain/repositories/AssignmentRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class GenerateResponsibilityTerm {
  constructor(
    private assetRepository: AssetRepository,
    private assignmentRepository: AssignmentRepository,
    private userRepository: UserRepository
  ) {}

  async execute(assetId: string): Promise<Buffer> {
    const asset = await this.assetRepository.findById(assetId);
    if (!asset) throw new Error('Ativo não encontrado');

    const assignment = await this.assignmentRepository.findActiveByAssetId(assetId);
    if (!assignment) throw new Error('Nenhuma atribuição ativa encontrada para este ativo');

    const user = await this.userRepository.findById(assignment.userId);
    if (!user) throw new Error('Usuário atribuído não encontrado');

    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Header
      doc.fontSize(20).text('TERMO DE RESPONSABILIDADE', { align: 'center' });
      doc.moveDown(2);

      // Body
      doc.fontSize(12).text(`Pelo presente Termo de Responsabilidade, eu, ${user.name}, declaro que recebi o equipamento listado abaixo, de propriedade da empresa, em perfeitas condições de uso e funcionamento.`, {
          align: 'justify'
      });
      doc.moveDown();

      // Asset Details
      doc.font('Helvetica-Bold').text('Detalhes do Equipamento:');
      doc.font('Helvetica').text(`Tipo: ${asset.type}`);
      doc.text(`Modelo: ${asset.model}`);
      doc.text(`Número de Série: ${asset.serial}`);
      doc.text(`Número da Etiqueta (Tag): ${asset.tagNumber}`);
      doc.text(`Data de Atribuição: ${assignment.assignedAt.toLocaleDateString('pt-BR')}`);
      doc.moveDown(2);

      // Footer clauses
      doc.text('Comprometo-me a zelar pela integridade e conservação do mesmo, assumindo a responsabilidade civil e criminal por eventuais danos causados por mau uso, negligência, perda ou extravio.', { align: 'justify'});
      doc.moveDown(4);

      // Signature
      doc.text('_________________________________________________', { align: 'center' });
      doc.text(`Assinatura: ${user.name}`, { align: 'center' });
      doc.text(`Data: _____/_____/_______`, { align: 'center' });

      doc.end();
    });
  }
}
