/**
 * Password hashing using Web Crypto API (PBKDF2).
 * Suitable for Cloudflare Workers.
 */

async function pbkdf2(password: string, salt: Uint8Array, iterations: number = 100000): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const baseKey = await crypto.subtle.importKey('raw', passwordData, 'PBKDF2', false, ['deriveBits']);

  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: salt,
      iterations: iterations,
    },
    baseKey,
    256 // 32 bytes
  );
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt);

  const saltHex = bufferToHex(salt);
  const hashHex = bufferToHex(hash);

  return `pbkdf2:${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const [method, saltHex, hashHex] = hash.split(':');

    if (method !== 'pbkdf2' || !saltHex || !hashHex) {
      return false;
    }

    const salt = hexToBuffer(saltHex);
    const computedHash = await pbkdf2(password, salt);
    const computedHashHex = bufferToHex(computedHash);

    return computedHashHex === hashHex;
  } catch {
    return false;
  }
}
