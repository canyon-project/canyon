import { test, expect } from '@playwright/test';

test.describe('Todo List', () => {
  test('basic add / toggle / delete flow', async ({ page }) => {
    await page.goto('/todo');

    const input = page.getByTestId('todo-input');
    const addButton = page.getByTestId('add-button');
    const list = page.getByTestId('todo-list');

    await expect(list).toBeVisible();

    // Add two tasks
    await input.fill('Buy milk');
    await addButton.click();
    await input.fill('Write tests');
    await addButton.click();

    // Verify two items exist
    const items = list.getByTestId('todo-item');
    await expect(items).toHaveCount(2);
    await expect(items.nth(0)).toContainText('Write tests');
    await expect(items.nth(1)).toContainText('Buy milk');

    // Toggle first item complete
    await items.nth(0).getByRole('checkbox', { name: 'toggle' }).check();
    // Text should be line-through (cannot easily assert style, but we can re-toggle to verify state changes)
    await items.nth(0).getByRole('checkbox', { name: 'toggle' }).uncheck();
    await items.nth(0).getByRole('checkbox', { name: 'toggle' }).check();

    // Delete second item
    await items.nth(1).getByRole('button', { name: 'delete' }).click();

    // Only one item remains
    await expect(list.getByTestId('todo-item')).toHaveCount(1);
    await expect(list.getByTestId('todo-item').nth(0)).toContainText('Write tests');
  });
});


