const {chromium} = require('playwright');
const main = async () => {
  const browser = await chromium.launch({headless: false})
  const page = await browser.newPage();

  // 进入被测页面
  await page.goto('https://test.com')

  // 监听visibilityChange事件
  page.on('visibilitychange', async () => {
    const coverage = await page.evaluate(`window.__coverage__`)
    const canyon = await page.evaluate(`window.__canyon__`)

    await fetch('{{dsn}}/coverage/client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer {{token}}'
      },
      body: JSON.stringify({
        coverage,
        ...canyon
      })
    })
  })

  // 执行测试用例
  // 用例
  await page.click('button')
  await page.fill('input', 'test')
  await page.click('text=submit')

  browser.close()
}

main()
