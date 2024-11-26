import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFilePath = path.join(__dirname, '../.env.example');
const destinationFilePath = path.join(__dirname, '../.env');

(async () => {
  try {
    await fs.access(destinationFilePath);
    console.log('The .env file already exists');
  } catch (err) {
    try {
      await fs.copyFile(sourceFilePath, destinationFilePath);

      let envStr = ``
      Object.entries(process.env).forEach(([key, value]) => {
        envStr += `${key}=${value}\n`
      });
      await fs.writeFile(destinationFilePath, envStr);

      console.log('The .env file has been successfully created');
    } catch (error) {
      console.error('Error copying file:', error);
    }
  }
})();
