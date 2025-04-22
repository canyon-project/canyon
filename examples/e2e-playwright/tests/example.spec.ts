import { test, expect } from './baseFixtures'

test('should increment counter when button is clicked', async ({ page }) => {
  // 访问测试页面
  await page.goto('https://canyon-project.github.io/example-vite-react-swc/')

  // 找到按钮并验证初始值
  const button = page.getByRole('button', { name: /count is/i })
  await expect(button).toHaveText('count is 0')

  // 点击按钮
  await button.click()
  await expect(button).toHaveText('count is 1')

  // 再点击一次
  await button.click()
  await expect(button).toHaveText('count is 2')
})
