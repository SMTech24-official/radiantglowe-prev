import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { IBooking } from './booking.interface';

export const generateInvoicePDF = async (
  booking: IBooking & {
    tenantId: { name: string; email: string };
    landlordId: { name: string; email: string };
    propertyId: { headlineYourProperty: string; location: { address: string }; rentPerMonth: number };
  }
): Promise<Buffer> => {
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
      const logoPath = path.join(__dirname, '../../../assets/logo.png'); // Adjust path as needed
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, doc.page.width - 150, 20, { width: 100 }); // Right-top corner
      }
    } catch (e) {
      console.warn('Logo not found or error loading logo:', e);
    }

    // === Header with Title ===
    doc
      .fontSize(24)
      .fillColor('#333333')
      .text('PROPERTY BOOKING INVOICE', { align: 'left' }) // Logo on right, title on left
      .moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor('gray')
      .text(`Generated on: ${new Date().toISOString().split('T')[0]}`, { align: 'left' })
      .moveDown(1);

    // === Booking Info ===
    doc
      .fontSize(12)
      .fillColor('#000000')
      .text(`Booking ID: ${booking.BID}`)
      .text(`Booking Date: ${booking.bookingDate.toISOString().split('T')[0]}`)
      .moveDown(1);

    // === Horizontal Line ===
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .strokeColor('#cccccc')
      .stroke()
      .moveDown(1);

    // === Tenant Info ===
    doc
      .fontSize(14)
      .fillColor('#005580')
      .text('Tenant Information', { underline: true })
      .fontSize(12)
      .fillColor('#000000')
      .text(`Name: ${booking.tenantId.name}`)
      .text(`Email: ${booking.tenantId.email}`)
      .moveDown();

    // === Landlord Info ===
    doc
      .fontSize(14)
      .fillColor('#005580')
      .text('Landlord Information', { underline: true })
      .fontSize(12)
      .fillColor('#000000')
      .text(`Name: ${booking.landlordId.name}`)
      .text(`Email: ${booking.landlordId.email}`)
      .moveDown();

    // === Property Info ===
    doc
      .fontSize(14)
      .fillColor('#005580')
      .text('Property Details', { underline: true })
      .fontSize(12)
      .fillColor('#000000')
      .text(`Headline: ${booking.propertyId.headlineYourProperty}`)
      .text(`Address: ${booking.propertyId.location.address}`)
      .text(`Rent Amount: $${(booking.propertyId.rentPerMonth ?? 0).toFixed(2)}`)
      .moveDown();

    // === Payment Info ===
    doc
      .fontSize(14)
      .fillColor('#005580')
      .text('Payment Details', { underline: true })
      .fontSize(12)
      .fillColor('#000000')
      .text(`Amount Paid: $${booking.amount.toFixed(2)}`)
      .text(`Method: ${booking.paymentMethod}`)
      .text(`Status: ${booking.paymentStatus}`);
    if (booking.paymentDate) {
      doc.text(`Payment Date: ${booking.paymentDate.toISOString().split('T')[0]}`);
    }
    doc.moveDown();

    // === Final Note ===
    doc
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('Note:')
      .font('Helvetica')
      .fillColor('#444444')
      .text(
        booking.paymentMethod === 'offline'
          ? 'Please complete the payment as per the agreed terms.'
          : 'Payment successfully completed via Paystack.'
      )
      .moveDown(2);

    // === Footer ===
    doc
      .fontSize(10)
      .fillColor('gray')
      .text('Thank you for using our platform.', { align: 'center' })
      .text('If you have any questions, contact support@yourcompany.com', { align: 'center' });

    doc.end();
  });
};
