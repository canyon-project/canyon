const {chromium} = require('playwright');
const main = async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage();
  // 进入被测页面
  await page.goto('http://test.com')
  // 执行测试用例
  // 用例1
  await page.click('button')
  // 用例2
  await page.fill('input', 'test')
  // 用例3
  await page.click('text=submit')
  const coverage = await page.evaluate(`window.__coverage__`)
  console.log(coverage)
  browser.close()
}

main()
