// coverageFixture.ts
import * as fs from "node:fs";
import * as path from "node:path";

export function createCoverageContextFixture({
                                               outputDir = '.nyc_output',
                                             }: {
  outputDir?: string;
} = {}) {
  return async ({ context }, use) => {
    await context.addInitScript(() => {
      window.addEventListener('beforeunload', () =>
        (window as any).collectIstanbulCoverage((window as any).__coverage__)
      );
    });

    await fs.promises.mkdir(outputDir, { recursive: true });

    await context.exposeFunction('collectIstanbulCoverage', (coverage) => {
      if (coverage) {
        fs.writeFileSync(
          path.join(outputDir, `coverage-${Date.now()}.json`),
          JSON.stringify(coverage)
        );
      }
    });

    await use(context);

    for (const page of context.pages()) {
      await page.evaluate(() =>
        (window as any).collectIstanbulCoverage((window as any).__coverage__)
      );
    }
  }
}
