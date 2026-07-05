/**
 * Upload validation util — magic-byte content detection + per-type size caps.
 *
 * All upload handlers MUST call validateUpload() BEFORE streaming to Cloudinary.
 * The client-supplied mimetype/extension is ignored for security; only the actual
 * file bytes are trusted.
 *
 * VIRUS SCANNING
 * ──────────────
 * Controlled by VIRUS_SCAN_ENABLED env var (default: false). When enabled:
 *   - Uses the `clamscan` npm package to talk to a running clamd daemon via TCP.
 *   - FAIL CLOSED: if clamd is unreachable or scan errors, the upload is rejected.
 *   - Set CLAMAV_HOST / CLAMAV_PORT to point at your daemon (default: localhost:3310).
 *
 * Local dev with Docker:
 *   docker run -d --name clamav -p 3310:3310 clamav/clamav:stable
 *   # Wait ~60s for signature DB to load, then set VIRUS_SCAN_ENABLED=true.
 *
 * Test with EICAR string (safe pseudo-virus for scanner validation):
 *   echo 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > eicar.txt
 */

import { fileTypeFromBuffer } from 'file-type';
import { env } from '../../config/env.js';

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

// ── Virus scan ────────────────────────────────────────────────────────────────

// Cache the initialised scanner so we don't re-init on every upload.
let _scanner = null;
let _scannerInitFailed = false;

async function getScanner() {
  if (_scanner) return _scanner;
  if (_scannerInitFailed) {
    throw new UploadError('Virus scanner unavailable. Upload rejected for safety.');
  }
  try {
    const { default: NodeClam } = await import('clamscan');
    _scanner = await new NodeClam().init({
      clamdscan: {
        active: true,
        host:   env.clamavHost,
        port:   env.clamavPort,
        timeout: 5000,
      },
      preference: 'clamdscan',
    });
    return _scanner;
  } catch (err) {
    _scannerInitFailed = true;
    throw new UploadError(`Virus scanner init failed (${env.clamavHost}:${env.clamavPort}): ${err.message}. Upload rejected.`);
  }
}

/**
 * Scan the buffer for malware via clamd TCP.
 *
 * FAIL CLOSED: any error (daemon down, timeout, init failure) rejects the upload.
 * When VIRUS_SCAN_ENABLED=false, this is a no-op.
 */
async function scanBuffer(buffer) {
  if (!env.virusScanEnabled) return;

  const scanner = await getScanner();

  let isInfected;
  try {
    ({ isInfected } = await scanner.scanBuffer(buffer));
  } catch (err) {
    throw new UploadError(`Virus scan error: ${err.message}. Upload rejected.`);
  }

  if (isInfected) {
    throw new UploadError('File failed security scan. Upload rejected.');
  }
}

// ── Error type ────────────────────────────────────────────────────────────────

export class UploadError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UploadError';
    this.isUploadError = true;
  }
}
