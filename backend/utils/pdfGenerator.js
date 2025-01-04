import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// backend/utils/pdfGenerator.js
export const generateEventApprovalPDF = async (event, ocaOfficer) => {
  const doc = new PDFDocument();
  
  // Use consistent filename format
  const filename = `event-approval-${event._id}-${Date.now()}.pdf`;
  const filepath = path.join(__dirname, '..', 'uploads', 'reports', filename);

  // Ensure reports directory exists
  const reportsDir = path.join(__dirname, '..', 'uploads', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  doc.pipe(fs.createWriteStream(filepath));

  // Header with university logo or name
  doc.fontSize(24).text('UniEventHub', { align: 'center' });
  doc.fontSize(16).text('Event Approval Certificate', { align: 'center' });
  doc.moveDown();
  
  // Add current date
  doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
  doc.moveDown();

  // Event Details
  doc.fontSize(16).text('Event Details');
  doc.moveDown();

  const details = [
    { label: 'Event Title', value: event.title },
    { label: 'Club Name', value: event.clubName },
    { label: 'Start Date', value: new Date(event.startDate).toLocaleDateString() },
    { label: 'End Date', value: new Date(event.endDate).toLocaleDateString() },
    { label: 'Total Budget', value: `${event.budget} BDT` },
    { label: 'Allocated Budget', value: `${event.allocatedBudget} BDT` },
    { label: 'Required Sponsorship', value: `${event.sponsorRequirement} BDT` },
  ];

  details.forEach(detail => {
    doc.fontSize(12).text(`${detail.label}: ${detail.value}`);
  });

  doc.moveDown();
  
  // Event Description
  doc.fontSize(16).text('Event Description');
  doc.moveDown();
  doc.fontSize(12).text(event.description);
  doc.moveDown();

  // Approval Details
  doc.fontSize(16).text('Approval Details');
  doc.moveDown();
  doc.fontSize(12)
     .text(`Approved by: ${ocaOfficer.name}`)
     .text(`Officer ID: ${ocaOfficer.userId}`)
     .text(`Approval Date: ${new Date(event.reviewedAt).toLocaleDateString()}`)
     .text(`Comments: ${event.comment || 'No comments'}`);

  // Add footer
  doc.fontSize(10)
     .text('This is an officially generated document by the Office of Co-Curricular Activities (OCA).', {
       align: 'center',
       bottom: 30
     });

  doc.end();

  return {
    filename,
    filepath
  };
};