import fs from 'fs/promises';
import path from 'path';

const sourceFilePath = path.join(new URL('.', import.meta.url).pathname, '../.env.example');
const destinationFilePath = path.join(new URL('.', import.meta.url).pathname, '../.env');

(async () => {
  try {
    await fs.access(destinationFilePath);
    console.log('The .env file already exists');
  } catch (err) {
    try {
      await fs.copyFile(sourceFilePath, destinationFilePath);
      console.log('The .env file has been successfully created');
    } catch (error) {
      console.error('Error copying file:', error);
    }
  }
})();
