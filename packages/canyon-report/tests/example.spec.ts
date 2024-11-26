import { test, expect } from './baseFixtures';

test('has title', async ({ page }) => {
  await page.goto('https://report-component.canyonjs.org');
  expect(await page.title()).toBe('Rsbuild App');
});
