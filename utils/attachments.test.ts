import { describe, it, expect } from 'vitest';
import { classifyFile, intakeFile, LIMITS } from './attachments';

// Minimal File polyfill helper — vitest's jsdom doesn't always provide a
// working File constructor with .arrayBuffer/.text, so wrap it.
function makeFile(name: string, content: string | Uint8Array, type: string = ''): File {
  const blob = new Blob([content], { type });
  // File constructor exists in jsdom; if not, fall back to a Blob with name
  // attached (most file-handling libs only need .name, .type, .size).
  try {
    return new File([blob], name, { type });
  } catch {
    const f = blob as unknown as File;
    Object.defineProperty(f, 'name', { value: name });
    return f;
  }
}

describe('attachments — classifyFile', () => {
  it('classifies images by MIME', () => {
    const f = makeFile('photo.jpg', 'x', 'image/jpeg');
    expect(classifyFile(f).kind).toBe('image');
  });

  it('classifies PDFs by MIME', () => {
    const f = makeFile('plan.pdf', 'x', 'application/pdf');
    expect(classifyFile(f).kind).toBe('pdf');
  });

  it('classifies PDFs by extension when MIME missing', () => {
    const f = makeFile('plan.pdf', 'x');
    expect(classifyFile(f).kind).toBe('pdf');
  });

  it('classifies DOCX as text-readable', () => {
    const f = makeFile('rfi.docx', 'x', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    const result = classifyFile(f);
    expect(result.kind).toBe('text');
    expect(result.reason).toBe('docx');
  });

  it('classifies XLSX as text-readable', () => {
    const f = makeFile('schedule.xlsx', 'x', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const result = classifyFile(f);
    expect(result.kind).toBe('text');
    expect(result.reason).toBe('xlsx');
  });

  it('classifies CSV by extension', () => {
    const f = makeFile('parts.csv', 'a,b\n1,2');
    const result = classifyFile(f);
    expect(result.kind).toBe('text');
  });

  it('classifies TXT by extension', () => {
    const f = makeFile('notes.txt', 'hello');
    expect(classifyFile(f).kind).toBe('text');
  });

  it('rejects DWG with a CAD-specific guidance message', () => {
    const f = makeFile('floor.dwg', 'x');
    const result = classifyFile(f);
    expect(result.kind).toBe('cad');
    expect(result.reason).toMatch(/export to PDF/i);
  });

  it('rejects DXF as CAD', () => {
    const f = makeFile('layout.dxf', 'x');
    expect(classifyFile(f).kind).toBe('cad');
  });

  it('rejects unknown types with a generic message', () => {
    const f = makeFile('mystery.xyz', 'x');
    const result = classifyFile(f);
    expect(result.kind).toBe('unsupported');
    expect(result.reason).toMatch(/not supported/i);
  });
});

describe('attachments — intakeFile (size + classification gates only)', () => {
  // FileReader-backed reads (TXT/CSV/DOCX/XLSX content extraction) require
  // a browser environment. The vitest node default has no FileReader and
  // installing jsdom just for these tests is heavyweight. We test the
  // pre-IO gates here (size + classification), which catch the bugs that
  // matter most. Browser-side flows are covered by manual QA + the
  // classifyFile tests above.

  it('rejects an image that exceeds the size cap (size-gate runs before IO)', async () => {
    const big = new Uint8Array(LIMITS.imageBytes + 100);
    const f = makeFile('huge.jpg', big, 'image/jpeg');
    const r = await intakeFile(f);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/MB.*max/i);
  });

  it('rejects a DWG file with CAD guidance (no IO needed)', async () => {
    const f = makeFile('plan.dwg', 'x');
    const r = await intakeFile(f);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/PDF/i);
  });

  it('rejects unknown extensions cleanly', async () => {
    const f = makeFile('mystery.xyz', 'x');
    const r = await intakeFile(f);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/not supported/i);
  });
});
