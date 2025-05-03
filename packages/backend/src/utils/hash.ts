import { createHash } from 'crypto';

export const transFormHash = (object) =>
  createHash('sha256').update(JSON.stringify(object)).digest('hex');
