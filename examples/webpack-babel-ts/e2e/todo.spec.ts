import { test, expect } from '../base';

test('counter increments on + click', async ({ page }) => {
  await page.goto('/index.html');

  const value = page.locator('#value');
  const inc = page.locator('#btn');

  await expect(value).toHaveText('0');
  await inc.click();
  await expect(value).toHaveText('1');
});


