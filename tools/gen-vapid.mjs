/* توليد مفاتيح VAPID (P-256) — يكتبهم في .tmp/ وبس */
import { writeFile, mkdir } from 'node:fs/promises';

const b64url = bytes => Buffer.from(bytes).toString('base64')
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const raw = new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey));   // 65 bytes
const jwk = await crypto.subtle.exportKey('jwk', kp.privateKey);

await mkdir('.tmp', { recursive: true });
await writeFile('.tmp/vapid-public.txt', b64url(raw) + '\n');
await writeFile('.tmp/vapid-private.txt', jwk.d + '\n');
console.log('vapid keys written: public', b64url(raw).length, 'chars');
