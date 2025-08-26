import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFilePath = path.join(__dirname, '../.env.example');
const destinationFilePath = path.join(__dirname, '../.env');

(async () => {
  try {
    await fs.access(destinationFilePath);
    console.log('The .env file already exists');
  } catch (_err) {
    try {
      await fs.copyFile(sourceFilePath, destinationFilePath);
      console.log('The .env file has been successfully created');
    } catch (error) {
      console.error('Error copying file:', error);
    }
  }
})();
