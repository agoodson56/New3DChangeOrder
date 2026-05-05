/**
 * File attachment intake for Change Order generation.
 *
 * Centralizes:
 *   - Type detection (image / pdf / text-readable / sheet / unsupported)
 *   - Size limits per kind
 *   - Text extraction from DOCX & XLSX (lazy-loaded — these libraries are
 *     large and only fetched when an operator actually uploads such a file)
 *
 * What goes WHERE in the AI request:
 *   - Images & PDFs    → Gemini inlineData parts (model reads natively)
 *   - Text/CSV/DOCX/XLSX → folded into the user_intent text prompt with
 *                          untrusted-data tagging (model reads as text)
 *
 * Why we don't accept DWG/DXF: AutoCAD's binary format is proprietary and
 * Gemini cannot read it. We tell the operator to export to PDF first, where
 * Gemini handles plan sheets very well (vector + text intact).
 */

/** What downstream code does with the attachment when calling the AI. */
export type AttachmentKind =
  | 'image'   // pass to AI as inlineData
  | 'pdf'     // pass to AI as inlineData (Gemini reads PDFs natively)
  | 'text';   // already-extracted text; fold into the intent prompt

export interface Attachment {
  kind: AttachmentKind;
  name: string;
  mimeType: string;
  /** For 'image' or 'pdf': data URI (base64 with `data:...,` prefix).
   *  For 'text': the extracted plain-text content. */
  content: string;
  /** Approximate byte size of the source file (post-extraction text uses
   *  the extracted-string length). Used for UI hints, not for security. */
  sizeBytes: number;
}

// ── Limits ────────────────────────────────────────────────────────────────────
// PDFs can be larger than image screenshots (multi-page floor plans). Office
// docs are usually small. Cap each by kind, with a generous overall limit.
export const LIMITS = {
  maxFiles: 10,
  imageBytes: 5 * 1024 * 1024,    // 5 MB
  pdfBytes: 15 * 1024 * 1024,     // 15 MB
  docBytes: 5 * 1024 * 1024,      // .docx
  sheetBytes: 5 * 1024 * 1024,    // .xlsx
  textBytes: 1 * 1024 * 1024,     // .txt / .csv
};

// ── Type / extension classification ───────────────────────────────────────────

/** Recognized "we know AutoCAD won't render in Gemini" extensions, used to
 *  show a specific guidance message instead of the generic "unsupported". */
const CAD_EXTENSIONS = new Set(['dwg', 'dxf', 'dgn', 'rvt', 'iam', 'ipt', 'sldprt', 'sldasm']);

export type IntakeOutcome =
  | { ok: true; attachment: Attachment }
  | { ok: false; reason: string };

/** Pure-function classifier: returns what the file would become, or why it can't. */
export function classifyFile(file: File): { kind: AttachmentKind | 'cad' | 'unsupported'; reason?: string } {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const mime = (file.type || '').toLowerCase();

  if (mime.startsWith('image/')) return { kind: 'image' };
  if (mime === 'application/pdf' || ext === 'pdf') return { kind: 'pdf' };

  // Text-extractable Office docs
  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) return { kind: 'text', reason: 'docx' };
  if (
    mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    ext === 'xlsx'
  ) return { kind: 'text', reason: 'xlsx' };

  // Plain text
  if (mime.startsWith('text/') || ['txt', 'csv', 'tsv', 'log'].includes(ext)) {
    return { kind: 'text', reason: ext };
  }

  if (CAD_EXTENSIONS.has(ext)) {
    return {
      kind: 'cad',
      reason: 'CAD files (DWG/DXF/etc.) can\'t be read by AI. Export to PDF first — Gemini handles plan-sheet PDFs very well (text + drawings intact).',
    };
  }

  return { kind: 'unsupported', reason: `File type "${mime || ext || 'unknown'}" is not supported. Supported: images (JPEG/PNG/WebP/HEIC), PDF, DOCX, XLSX, TXT, CSV.` };
}

// ── Readers ───────────────────────────────────────────────────────────────────

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  });
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsText(file);
  });
}

function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.readAsArrayBuffer(file);
  });
}

/** Extract plain text from a .docx (lazy-loads mammoth). */
async function extractDocxText(file: File): Promise<string> {
  const buf = await readAsArrayBuffer(file);
  // Dynamic import keeps mammoth out of the main bundle. It only loads when
  // the operator actually uploads a Word doc.
  const mammoth = await import('mammoth');
  // mammoth.extractRawText returns { value, messages }. We ignore messages
  // (they're conversion warnings, not errors) and just take the text.
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return (result.value || '').trim();
}

/** Extract sheet contents from a .xlsx (lazy-loads exceljs). Each sheet is
 *  rendered as CSV with a sheet header so the AI knows which cells came
 *  from which tab. */
async function extractXlsxText(file: File): Promise<string> {
  const buf = await readAsArrayBuffer(file);
  // Dynamic import keeps exceljs out of the main bundle.
  const ExcelJS = await import('exceljs');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);
  const out: string[] = [];
  wb.eachSheet((sheet) => {
    out.push(`=== Sheet: ${sheet.name} ===`);
    sheet.eachRow({ includeEmpty: false }, (row) => {
      // Excel cells can contain rich text, formulas, dates. coerce to string.
      const values = Array.isArray(row.values) ? row.values.slice(1) : []; // drop leading null
      const csvRow = values.map(cell => csvEscape(stringifyCell(cell))).join(',');
      out.push(csvRow);
    });
    out.push(''); // blank line between sheets
  });
  return out.join('\n').trim();
}

function stringifyCell(cell: unknown): string {
  if (cell == null) return '';
  if (typeof cell === 'string' || typeof cell === 'number' || typeof cell === 'boolean') return String(cell);
  if (cell instanceof Date) return cell.toISOString().slice(0, 10);
  // Rich text / formula objects: try .result, .text, fallback to JSON
  const c = cell as { result?: unknown; text?: unknown; richText?: Array<{ text?: string }> };
  if (typeof c.result === 'string' || typeof c.result === 'number') return String(c.result);
  if (typeof c.text === 'string') return c.text;
  if (Array.isArray(c.richText)) return c.richText.map(r => r.text || '').join('');
  return '';
}

function csvEscape(s: string): string {
  if (s == null) return '';
  // Quote if value contains comma, quote, or newline.
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// ── Public entry point ────────────────────────────────────────────────────────

/**
 * Convert a browser File into an Attachment ready for the AI. Returns
 * { ok: false, reason } on size violation, unsupported type, or extraction
 * failure — caller surfaces the reason to the operator.
 */
export async function intakeFile(file: File): Promise<IntakeOutcome> {
  const cls = classifyFile(file);

  if (cls.kind === 'cad' || cls.kind === 'unsupported') {
    return { ok: false, reason: cls.reason || 'Unsupported file type.' };
  }

  // Size gates per kind.
  if (cls.kind === 'image' && file.size > LIMITS.imageBytes) {
    return { ok: false, reason: `Image "${file.name}" is ${formatMB(file.size)} (max ${formatMB(LIMITS.imageBytes)}).` };
  }
  if (cls.kind === 'pdf' && file.size > LIMITS.pdfBytes) {
    return { ok: false, reason: `PDF "${file.name}" is ${formatMB(file.size)} (max ${formatMB(LIMITS.pdfBytes)}).` };
  }
  if (cls.kind === 'text') {
    const r = cls.reason || '';
    if (r === 'docx' && file.size > LIMITS.docBytes) {
      return { ok: false, reason: `DOCX "${file.name}" is ${formatMB(file.size)} (max ${formatMB(LIMITS.docBytes)}).` };
    }
    if (r === 'xlsx' && file.size > LIMITS.sheetBytes) {
      return { ok: false, reason: `XLSX "${file.name}" is ${formatMB(file.size)} (max ${formatMB(LIMITS.sheetBytes)}).` };
    }
    if (r !== 'docx' && r !== 'xlsx' && file.size > LIMITS.textBytes) {
      return { ok: false, reason: `Text file "${file.name}" is ${formatMB(file.size)} (max ${formatMB(LIMITS.textBytes)}).` };
    }
  }

  try {
    if (cls.kind === 'image' || cls.kind === 'pdf') {
      const dataUrl = await readAsDataUrl(file);
      return {
        ok: true,
        attachment: {
          kind: cls.kind,
          name: file.name,
          mimeType: file.type || (cls.kind === 'pdf' ? 'application/pdf' : 'image/jpeg'),
          content: dataUrl,
          sizeBytes: file.size,
        },
      };
    }

    // Text branches
    let text: string;
    if (cls.reason === 'docx') {
      text = await extractDocxText(file);
    } else if (cls.reason === 'xlsx') {
      text = await extractXlsxText(file);
    } else {
      text = await readAsText(file);
    }
    if (!text.trim()) {
      return { ok: false, reason: `"${file.name}" appears to be empty after extraction.` };
    }
    return {
      ok: true,
      attachment: {
        kind: 'text',
        name: file.name,
        mimeType: file.type || 'text/plain',
        content: text,
        sizeBytes: text.length,
      },
    };
  } catch (e) {
    return {
      ok: false,
      reason: `Failed to extract "${file.name}": ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

function formatMB(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
