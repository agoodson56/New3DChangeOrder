/**
 * JWT token creation and verification.
 * Uses HMAC-SHA256 for signing.
 */

interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

function base64UrlEncode(data: string): string {
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(data: string): string {
  const padded = data + '='.repeat((4 - (data.length % 4)) % 4);
  return atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
}

async function hmacSha256(key: string, data: string): Promise<ArrayBuffer> {
  const keyData = new TextEncoder().encode(key);
  const msgData = new TextEncoder().encode(data);
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', cryptoKey, msgData);
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64UrlEncode(binary);
}

export async function createToken(payload: JWTPayload, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + 24 * 60 * 60, // 24 hours
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(tokenPayload));
  const signatureInput = `${headerEncoded}.${payloadEncoded}`;

  const signature = await hmacSha256(secret, signatureInput);
  const signatureEncoded = arrayBufferToBase64Url(signature);

  return `${signatureInput}.${signatureEncoded}`;
}

export async function verifyToken(token: string, secret: string): Promise<JWTPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerEncoded, payloadEncoded, signatureEncoded] = parts;

  try {
    const payload = JSON.parse(base64UrlDecode(payloadEncoded));

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;

    const signatureInput = `${headerEncoded}.${payloadEncoded}`;
    const signature = await hmacSha256(secret, signatureInput);
    const expectedSignature = arrayBufferToBase64Url(signature);

    if (signatureEncoded !== expectedSignature) return null;

    return payload as JWTPayload;
  } catch {
    return null;
  }
}
