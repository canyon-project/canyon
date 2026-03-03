import fs from 'node:fs'
import path from 'node:path'
import { glob } from 'node:fs/promises'

const frontmatterRegex = /^\s*---(\n[\s\S]*?)\n---\n/

/** 假定在 docs 目录下执行 (npm run build-llm-docs)，docs 即 cwd */
const docsDir = process.cwd()
const contentDir = path.join(docsDir, 'content')
const publicDir = path.join(docsDir, 'public')

/** 文档站 base URL，用于生成链接 */
const DOCS_BASE_URL = process.env.DOCS_BASE_URL ?? 'https://canyon.js.org'

const sliceExt = (file: string) => file.split('.').slice(0, -1).join('.')

const extractLabel = (file: string) => sliceExt(file.split('/').pop() ?? '')

function capitalizeDelimiter(str: string) {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

/** 将 content 内相对路径转为站点路径，如 content/docs/getting-started/intro.mdx -> /docs/getting-started/intro */
function toDocPath(file: string): string {
  const withoutContent = file.replace(/^content\/?/, '')
  return '/' + sliceExt(withoutContent)
}

async function generateLLMDocs() {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  const pattern = '**/*.{md,mdx}'
  const allFiles: string[] = []
  for await (const file of glob(pattern, { cwd: contentDir })) {
    allFiles.push(file)
  }
  const sortedFiles = allFiles.sort()

  const outputListFile = path.join(publicDir, 'llms.txt')
  const optionals = sortedFiles.map(
    (file) =>
      `- [${capitalizeDelimiter(extractLabel(file))}](${DOCS_BASE_URL}${toDocPath(file)})`
  )

  fs.writeFileSync(
    outputListFile,
    [
      '# Canyon',
      '',
      '> Canyon 是更准确的 JavaScript 代码覆盖率收集平台，解决端到端测试期间的覆盖率收集难题。',
      '',
      '## Docs',
      '',
      `- [Full Docs](${DOCS_BASE_URL}/llms-full.txt) 完整文档（仅正文，无示例代码块外的示例）`,
      `- [Small Docs](${DOCS_BASE_URL}/llms-small.txt) 精简文档（核心概念与入门）`,
      '',
      '## Optional',
      '',
      ...optionals,
    ].join('\n'),
    'utf-8'
  )
  console.log(`< Output '${outputListFile}'`)

  const outputFullFile = path.join(publicDir, 'llms-full.txt')
  const fullContent = await generateContent(
    sortedFiles,
    contentDir,
    '<SYSTEM>This is the full developer documentation for Canyon (JavaScript code coverage platform).</SYSTEM>\n\n'
  )
  fs.writeFileSync(outputFullFile, fullContent, 'utf-8')
  console.log(`< Output '${outputFullFile}'`)

  const outputSmallFile = path.join(publicDir, 'llms-small.txt')
  const smallExclude = ['self-host', 'support']
  const smallFiles = sortedFiles.filter(
    (file) => !smallExclude.some((ex) => file.startsWith(ex))
  )
  const smallContent = await generateContent(
    smallFiles,
    contentDir,
    '<SYSTEM>This is the tiny developer documentation for Canyon (core concepts and getting started).</SYSTEM>\n\n'
  )
  fs.writeFileSync(outputSmallFile, smallContent, 'utf-8')
  console.log(`< Output '${outputSmallFile}'`)
}

async function generateContent(
  files: string[],
  baseDir: string,
  header: string
): Promise<string> {
  let content = header + '# Start of Canyon documentation\n\n'
  for (const file of files) {
    console.log(`> Writing '${file}'`)
    const filePath = path.join(baseDir, file)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    content += fileContent.replace(frontmatterRegex, '').trim() + '\n\n'
  }
  return content
}

generateLLMDocs().catch(console.error)
