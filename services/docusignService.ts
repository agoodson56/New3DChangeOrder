/**
 * Client wrapper for /api/docusign — sends the rendered CO/proposal to
 * a customer for e-signature.
 *
 * Strategy: capture the DOM as a PDF using the browser's Print-to-PDF
 * pipeline. We can't directly call window.print() and capture to a Blob,
 * so for v1 we ask the user to attach a PDF they've already exported
 * (from the print dialog → Save as PDF). Future: integrate jsPDF or
 * pdfme so we can generate the PDF client-side without a print step.
 */

export interface DocusignSendArgs {
  pdfFile: File | Blob;
  filename?: string;
  subject: string;
  message?: string;
  signer: { email: string; name: string };
  ccs?: Array<{ email: string; name: string }>;
  poNumber?: string;
}

export interface DocusignSendResult {
  envelopeId: string;
  status: string;
  sentAt: number;
}

export class DocusignNotConfiguredError extends Error {
  constructor() {
    super('DocuSign is not configured on the server. See functions/api/docusign.ts for setup.');
    this.name = 'DocusignNotConfiguredError';
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip the "data:application/pdf;base64," prefix
      const idx = result.indexOf(',');
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}

export async function sendForSignature(args: DocusignSendArgs): Promise<DocusignSendResult> {
  const pdfBase64 = await blobToBase64(args.pdfFile);

  const res = await fetch('/api/docusign', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pdfBase64,
      filename: args.filename || (args.pdfFile instanceof File ? args.pdfFile.name : 'change-order.pdf'),
      subject: args.subject,
      message: args.message,
      signer: args.signer,
      ccs: args.ccs,
      poNumber: args.poNumber,
    }),
  });

  if (res.status === 503) {
    throw new DocusignNotConfiguredError();
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`DocuSign send failed (HTTP ${res.status}): ${text.slice(0, 300)}`);
  }
  const data = await res.json() as DocusignSendResult & { configured?: boolean };
  if (!data.envelopeId) {
    throw new Error('DocuSign returned no envelope id');
  }
  return data;
}
