/**
 * Upload validation util — magic-byte content detection + per-type size caps.
 *
 * All upload handlers MUST call validateUpload() BEFORE streaming to Cloudinary.
 * The client-supplied mimetype/extension is ignored for security; only the actual
 * file bytes are trusted.
 *
 * VIRUS SCANNING GAP
 * ──────────────────
 * VIRUS_SCAN_ENABLED is currently false. No ClamAV / clamd daemon is reachable on
 * this deployment. scanBuffer() is a declared integration point — wire it to clamscan
 * when a scanner becomes available. Do NOT set VIRUS_SCAN_ENABLED = true without a
 * working scanner; doing so would scan nothing while logging a false "configured" state.
 *
 * KNOWN TRACKED GAP: virus scanning is not active. Mitigation in place: strict
 * allowlist of MIME types + magic-byte verification (no executable-disguised-as-PDF).
 */

import { fileTypeFromBuffer } from 'file-type';

const VIRUS_SCAN_ENABLED = false;

// ── Allowlists ────────────────────────────────────────────────────────────────

/** Resumes and certificates */
export const DOCUMENT_TYPES = {
  mimes:    new Set(['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  maxBytes: 5 * 1024 * 1024,   // 5 MB
  label:    'PDF or DOCX',
};

/** Profile photos, cover images, company logos */
export const IMAGE_TYPES = {
  mimes:    new Set(['image/jpeg', 'image/png', 'image/webp']),
  maxBytes: 2 * 1024 * 1024,   // 2 MB
  label:    'JPEG, PNG, or WebP',
};

// ── Buffer helpers ────────────────────────────────────────────────────────────

/**
 * Drain a Fastify multipart file stream into a Buffer.
 * Enforces a hard ceiling on bytes read so an oversized upload cannot exhaust memory.
 */
export async function bufferStream(stream, maxBytes) {
  const chunks = [];
  let total = 0;

  for await (const chunk of stream) {
    total += chunk.length;
    if (total > maxBytes) {
      // Destroy the stream to free resources, then signal the caller.
      stream.destroy();
      throw new UploadError(`File exceeds the ${Math.round(maxBytes / (1024 * 1024))} MB limit.`);
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

// ── Validation ────────────────────────────────────────────────────────────────

/**
 * Validates file content and size against an allowlist.
 *
 * @param {Buffer} buffer   - The full file buffer (from bufferStream)
 * @param {{ mimes: Set<string>, maxBytes: number, label: string }} allowlist
 * @throws {UploadError} with a user-facing message if validation fails
 */
export async function validateUpload(buffer, allowlist) {
  // Size check (belt-and-suspenders; bufferStream already enforces this)
  if (buffer.length > allowlist.maxBytes) {
    throw new UploadError(`File exceeds the ${Math.round(allowlist.maxBytes / (1024 * 1024))} MB limit.`);
  }

  // Magic-byte detection — client-supplied MIME/extension is not trusted
  const detected = await fileTypeFromBuffer(buffer);
  const mime = detected?.mime ?? null;

  if (!mime || !allowlist.mimes.has(mime)) {
    throw new UploadError(`Only ${allowlist.label} files are allowed.`);
  }

  // Virus scan integration point (currently not configured)
  await scanBuffer(buffer);
}

// ── Virus scan integration point ──────────────────────────────────────────────

/**
 * Scan the buffer for malware before uploading.
 *
 * CURRENTLY NOT CONFIGURED — VIRUS_SCAN_ENABLED is false.
 * To enable: install clamav + clamscan npm package, start clamd, set the flag true.
 * Never set VIRUS_SCAN_ENABLED = true without a working scanner daemon.
 */
async function scanBuffer(buffer) {
  if (!VIRUS_SCAN_ENABLED) {
    // KNOWN TRACKED GAP: virus scanning not active. See module JSDoc.
    return;
  }

  // Wire clamscan here when a daemon is available:
  //   const { ClamScan } = await import('clamscan');
  //   const scanner = await new ClamScan().init({ clamdscan: { active: true } });
  //   const { isInfected } = await scanner.scanBuffer(buffer);
  //   if (isInfected) throw new UploadError('File failed security scan. Upload rejected.');
  throw new Error('scanBuffer: VIRUS_SCAN_ENABLED is true but no scanner is configured.');
}

// ── Error type ────────────────────────────────────────────────────────────────

export class UploadError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UploadError';
    this.isUploadError = true;
  }
}
