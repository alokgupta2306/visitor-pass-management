import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const ensurePassDir = () => {
  const dir = path.join(process.cwd(), 'backend', 'uploads', 'passes');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

export const generatePassPdf = async ({ visitor, qrCodeData }) => {
  const dir = ensurePassDir();
  const filename = `pass-${visitor._id}-${Date.now()}.pdf`;
  const filepath = path.join(dir, filename);

  const doc = new PDFDocument();
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  doc.fontSize(20).text('Visitor Pass', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Name: ${visitor.fullName}`);
  if (visitor.host) doc.text(`Host: ${visitor.host}`);
  if (visitor.purpose) doc.text(`Purpose: ${visitor.purpose}`);
  doc.text(`Issued: ${new Date().toLocaleString()}`);

  if (qrCodeData) {
    doc.moveDown();
    doc.text('QR Code:');
    doc.image(qrCodeData, { fit: [200, 200], align: 'center' });
  }

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return `passes/${filename}`;
};


