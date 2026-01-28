import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 获取并打印版本信息
 */
export function printVersion(): void {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const packageJsonPath = resolve(__dirname, '../../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    console.log(`${packageJson.name} v${packageJson.version}`);
  } catch (error) {
    console.warn('Warning: Failed to read version from package.json', error);
  }
}
