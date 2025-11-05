import * as crypto from 'crypto';
import { ENV_NOT_FOUND_KEY_DATA_ENCRYPTION_KEY } from './errors';

// Encrypt and Decrypt functions. InfraConfig and Account table uses these functions to encrypt and decrypt the data.
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

/**
 * Encrypts a text using a key
 * @param text The text to encrypt
 * @param key The key to use for encryption
 * @returns The encrypted text
 */
export function encrypt(text: string, key = process.env.DATA_ENCRYPTION_KEY) {
  if (!key) throw new Error(ENV_NOT_FOUND_KEY_DATA_ENCRYPTION_KEY);

  if (!text || text === '') return text;

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ENCRYPTION_ALGORITHM,
    Buffer.from(key),
    iv,
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts a text using a key
 * @param text The text to decrypt
 * @param key The key to use for decryption
 * @returns The decrypted text
 */
export function decrypt(
  encryptedData: string,
  key = process.env.DATA_ENCRYPTION_KEY,
) {
  if (!key) throw new Error(ENV_NOT_FOUND_KEY_DATA_ENCRYPTION_KEY);

  if (!encryptedData || encryptedData === '') {
    return encryptedData;
  }

  const textParts = encryptedData.split(':');
  // @ts-expect-error
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    Buffer.from(key),
    iv,
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
