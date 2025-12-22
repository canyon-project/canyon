import { createHash } from 'node:crypto';
import stringify from 'json-stable-stringify';

// 需要使用 json-stable-stringify 来确保对象的键顺序稳定
export const generateObjectSignature = (object: unknown) =>
  createHash('sha1')
    .update(stringify(object) || '')
    .digest('hex');
