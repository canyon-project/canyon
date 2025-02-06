import * as fs from 'fs';
import * as path from 'path';
import {test as baseTest} from '@playwright/test';

const canyonOutputDirPath = path.join(process.cwd(), '.canyon_output');

export const test = baseTest.extend({
  context: async ({context}, use) => {
    await context.addInitScript(() =>
      window.addEventListener('beforeunload', () =>
        (window as any).collectIstanbulCoverage((window as any).__coverage__)
      ),
    );
    await fs.promises.mkdir(canyonOutputDirPath, {recursive: true});
    await context.exposeFunction('collectIstanbulCoverage', (coverageJSON) => {
      if (coverageJSON) {
        fs.writeFileSync(path.join(canyonOutputDirPath, `coverage-final-${new Date().valueOf()}.json`), JSON.stringify(coverageJSON));
      }
    });
    await use(context);
    for (const page of context.pages()) {
      await page.evaluate(() => (window as any).collectIstanbulCoverage((window as any).__coverage__));
    }
  }
});

export const expect = test.expect;
