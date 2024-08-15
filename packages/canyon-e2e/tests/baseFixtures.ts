import * as fs from 'fs';
import * as path from 'path';
import {test as baseTest} from '@playwright/test';

const canyonOutputDirPath = path.join(process.cwd(), '.canyon_output');

export const test = baseTest.extend({
  context: async ({context}, use) => {
    await context.addInitScript(() =>
      window.addEventListener('beforeunload', () =>
        (window as any).collectIstanbulCoverage((window as any).__coverage__, (window as any).__canyon__)
      ),
    );
    await fs.promises.mkdir(canyonOutputDirPath, {recursive: true});
    await context.exposeFunction('collectIstanbulCoverage', (coverageJSON, canyonJSON) => {
      if (coverageJSON && canyonJSON) {
        fs.writeFileSync(path.join(canyonOutputDirPath, `${new Date().valueOf()}.json`), JSON.stringify({
          ...canyonJSON,
          coverage: coverageJSON
        }));
      }
    });
    await use(context);
    for (const page of context.pages()) {
      await page.evaluate(() => (window as any).collectIstanbulCoverage((window as any).__coverage__, (window as any).__canyon__))
    }
  }
});

export const expect = test.expect;
