import { createCoverageContextFixture } from '@canyonjs/playwright';
import { test as baseTest } from '@playwright/test';

export const test = baseTest.extend({
  context: createCoverageContextFixture({
    outputDir: '.canyon_output',
  }),
});

export const expect = test.expect;
