import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { IEarningsReport } from './dashboard.interface';

export const generateEarningsReportPDF = async (data: IEarningsReport): Promise<Buffer> => {
  const doc = new PDFDocument({ margin: 50 });
  const buffers: Uint8Array[] = [];

  doc.on('data', (chunk) => buffers.push(chunk));

  return new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    doc.on('error', reject);

    // === Logo ===
    try {
      const logoPath = path.join(__dirname, '../../../assets/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, doc.page.width - 150, 20, { width: 100 });
      }
    } catch (e) {
      console.warn('Logo not found or error loading logo:', e);
    }

    // === Header with Title ===
    doc
      .font('Helvetica-Bold')
      .fontSize(24)
      .fillColor('#333333')
      .text('PLATFORM EARNINGS REPORT', { align: 'left' })
      .moveDown(0.5);

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('gray')
      .text(`Generated on: ${new Date().toISOString().split('T')[0]}`, { align: 'left' })
      .moveDown(1);

    // === Monthly Earnings Table ===
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#005580')
      .text('Monthly Earnings', { underline: true })
      .moveDown(0.5);

    // Table Header
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#000000')
      .text('Month', 50, doc.y, { width: 200, align: 'left' })
      .text('Earnings (USD)', 250, doc.y - 12, { width: 200, align: 'right' });
    doc
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .strokeColor('#cccccc')
      .stroke()
      .moveDown(0.5);

    // Table Rows
    data.monthly.forEach(row => {
      if (doc.y > doc.page.height - 100) {
        doc.addPage();
      }
      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#000000')
        .text(row.month, 50, doc.y, { width: 200, align: 'left' })
        .text(`$${row.earnings.toFixed(2)}`, 250, doc.y, { width: 200, align: 'right' });
      doc.moveDown(0.5);
    });

    doc.moveDown(1);

    // === Yearly Earnings Table ===
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#005580')
      .text('Yearly Earnings', { underline: true })
      .moveDown(0.5);

    // Table Header
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#000000')
      .text('Year', 50, doc.y, { width: 200, align: 'left' })
      .text('Earnings (USD)', 250, doc.y - 12, { width: 200, align: 'right' });
    doc
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .strokeColor('#cccccc')
      .stroke()
      .moveDown(0.5);

    // Table Rows
    data.yearly.forEach(row => {
      if (doc.y > doc.page.height - 100) {
        doc.addPage();
      }
      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#000000')
        .text(row.year, 50, doc.y, { width: 200, align: 'left' })
        .text(`$${row.earnings.toFixed(2)}`, 250, doc.y, { width: 200, align: 'right' });
      doc.moveDown(0.5);
    });

    doc.moveDown(1);

    // === Overall Earnings ===
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#005580')
      .text('Overall Earnings', { underline: true })
      .moveDown(0.5);

    // Table Header
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#000000')
      .text('Total', 50, doc.y, { width: 200, align: 'left' })
      .text('Earnings (USD)', 250, doc.y - 12, { width: 200, align: 'right' });
    doc
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .strokeColor('#cccccc')
      .stroke()
      .moveDown(0.5);

    // Table Row
    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor('#000000')
      .text('Overall', 50, doc.y, { width: 200, align: 'left' })
      .text(`$${data.overall.toFixed(2)}`, 250, doc.y, { width: 200, align: 'right' });
    doc.moveDown(1);

    // === Footer ===
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('gray')
      .text('Thank you for using our platform.', { align: 'center' })
      .text('If you have any questions, contact support@yourcompany.com', { align: 'center' })
      .moveDown(0.5)
      .text(`Page ${(doc.page as any).number} of ${doc.bufferedPageRange().count}`, { align: 'center' });

    doc.end();
  });
};