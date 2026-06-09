import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;
const IV_LENGTH = 12;

function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}

export function encrypt(plaintext: string, encryptionKey: string): { ciphertext: string; iv: string } {
  const key = Buffer.from(encryptionKey, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  const ciphertext = authTag.toString('hex') + encrypted;
  
  return {
    ciphertext,
    iv: iv.toString('hex'),
  };
}

export function decrypt(ciphertext: string, iv: string, encryptionKey: string): string {
  const key = Buffer.from(encryptionKey, 'hex');
  const ivBuffer = Buffer.from(iv, 'hex');
  
  const authTag = Buffer.from(ciphertext.slice(0, TAG_LENGTH * 2), 'hex');
  const encryptedData = ciphertext.slice(TAG_LENGTH * 2);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
