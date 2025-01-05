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

// Add this new function after generateEventApprovalPDF
export const generateSponsorshipReport = async (event) => {
  // Create uploads/reports directory if it doesn't exist
  const reportsDir = path.join(__dirname, '..', 'uploads', 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });

  const doc = new PDFDocument();
  const filename = `sponsorship-report-${event._id}-${Date.now()}.pdf`;
  const filepath = path.join(reportsDir, filename);

  // Create write stream
  const writeStream = fs.createWriteStream(filepath);
  doc.pipe(writeStream);

  // Content generation
  doc.fontSize(24).text('UniEventHub', { align: 'center' });
  doc.fontSize(16).text('Event Sponsorship Report', { align: 'center' });
  doc.moveDown();

  // Event Details
  doc.fontSize(14).text('Event Information', { underline: true });
  doc.moveDown();
  doc.fontSize(12)
    .text(`Event Title: ${event.title}`)
    .text(`Club Name: ${event.clubName}`)
    .text(`Event Dates: ${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`);
  doc.moveDown();

  // Budget Information
  doc.fontSize(14).text('Budget Information', { underline: true });
  doc.moveDown();
  doc.fontSize(12)
    .text(`Total Budget Required: ${event.budget} BDT`)
    .text(`OCA Allocated Budget: ${event.allocatedBudget} BDT`)
    .text(`Initial Sponsorship Required: ${event.budget - event.allocatedBudget} BDT`);
  doc.moveDown();

  // Sponsorship Summary
  doc.fontSize(14).text('Sponsorship Summary', { underline: true });
  doc.moveDown();

  let totalSponsorship = 0;
  if (event.sponsors && event.sponsors.length > 0) {
    const approvedSponsors = event.sponsors.filter(sponsor => sponsor.status === 'approved');
    
    if (approvedSponsors.length > 0) {
      approvedSponsors.forEach(sponsor => {
        doc.fontSize(12)
          .text(`Sponsor Name: ${sponsor.sponsorName}`)
          .text(`Amount: ${sponsor.amount} BDT`)
          .text(`Approved By: ${sponsor.reviewedBy?.name || 'N/A'}`)
          .text(`Approval Date: ${sponsor.reviewedAt ? new Date(sponsor.reviewedAt).toLocaleDateString() : 'N/A'}`)
          .moveDown();
        totalSponsorship += sponsor.amount;
      });

      doc.moveDown()
        .fontSize(12)
        .text(`Total Sponsorship Received: ${totalSponsorship} BDT`, { bold: true })
        .text(`Remaining Requirement: ${Math.max(0, event.sponsorRequirement - totalSponsorship)} BDT`);
    } else {
      doc.fontSize(12).text('No approved sponsors yet.');
    }
  } else {
    doc.fontSize(12).text('No sponsors registered for this event.');
  }

  // Footer
  doc.moveDown().moveDown();
  doc.fontSize(10)
    .text('This is an official sponsorship report generated by UniEventHub.', {
      align: 'center',
      bottom: 30
    });

  // Return a Promise that resolves when the PDF is fully written
  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      resolve({ filename, filepath });
    });
    writeStream.on('error', reject);
    doc.end();
  });
};