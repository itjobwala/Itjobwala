import fetch   from 'node-fetch';
import mammoth  from 'mammoth';
import { PDFParse } from 'pdf-parse';

/**
 * Download a file from a URL and return it as a Buffer.
 */
async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch resume: ${res.status} ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Detect file type from URL path.
 */
function detectFileType(url = '') {
  const u = url.toLowerCase().split('?')[0];
  if (u.endsWith('.pdf'))  return 'pdf';
  if (u.endsWith('.docx')) return 'docx';
  if (u.endsWith('.doc'))  return 'doc';
  return 'unknown';
}

/**
 * Extract plain text from a PDF buffer using pdf-parse v2 (PDFParse class).
 */
async function extractFromPdf(buffer) {
  const parser = new PDFParse({ data: buffer, verbosity: 0 });
  await parser.load();
  const result = await parser.getText();
  await parser.destroy();
  return (result.text || '').trim();
}

/**
 * Extract plain text from a DOCX buffer using mammoth.
 */
async function extractFromDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return (result.value || '').trim();
}

/**
 * Primary export: fetch a resume from a URL and return its plain text.
 * Supports PDF and DOCX formats.
 */
export async function extractTextFromResumeUrl(url) {
  if (!url) throw new Error('No resume URL provided.');

  const buffer   = await fetchBuffer(url);
  const fileType = detectFileType(url);

  if (fileType === 'pdf')  return extractFromPdf(buffer);
  if (fileType === 'docx') return extractFromDocx(buffer);

  // Fallback: try PDF first, then DOCX
  try {
    return await extractFromPdf(buffer);
  } catch {
    return await extractFromDocx(buffer);
  }
}
