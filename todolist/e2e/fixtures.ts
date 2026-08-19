import { test as base } from "@playwright/test";
import { createCoverageContextFixture } from "@canyonjs/playwright";

export const test = base.extend({
  context: async ({ context }, use) => {
    const collect = createCoverageContextFixture({
      outputDir: ".canyon_output",
    });
    await collect({ context }, use);
  },
});

export const expect = test.expect;
