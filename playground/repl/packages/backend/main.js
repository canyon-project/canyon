const express = require('express');
const bodyParser = require('body-parser');
const { transformSync } = require('@babel/core');
const vm = require('vm');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());

app.use(cors())

app.use(express.static(
  require('path').join(__dirname, '../frontend/dist')
));

app.post('/api/transform', (req, res) => {
  const inputCode = (req.body.code || 'console.log("hello world")');
  const filename = req.body.filename || 'input.ts';
  const plugins = req.body.plugins || ['istanbul'];
  if (!inputCode) {
    return res.status(400).json({ error: 'empty input' });
  }

  let transformedCode = '';
  try {
    const result = transformSync(inputCode, {
      filename: filename,
      presets: ['@babel/preset-typescript'],
      plugins: plugins,
      babelrc: false,
      configFile: false,
    });
    transformedCode = result.code;
  } catch (e) {
    return res.status(400).json({ error: 'transform failed', detail: e && e.message ? e.message : String(e) });
  }

  const logs = [];
  const sandboxConsole = {
    log: (...args) => logs.push(args)
  };

  const sandboxGlobal = {};
  // 将三者互指，模拟浏览器全局
  sandboxGlobal.console = sandboxConsole;
  sandboxGlobal.window = sandboxGlobal;
  sandboxGlobal.self = sandboxGlobal;
  sandboxGlobal.globalThis = sandboxGlobal;
  const sandbox = sandboxGlobal;
  try {
    const script = new vm.Script(transformedCode, { filename: 'input.js' });
    script.runInNewContext(sandbox, { timeout: 500 });
  } catch (e) {
    logs.push(`[runtime error] ${e && e.message ? e.message : String(e)}`);
  }

  return res.json({ code: transformedCode, logs,coverage: Object.values(sandbox.window.__coverage__)[0] });
});

app.get('/health', (_req, res) => {
  res.send('ok');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
