import fs from 'fs'
import readline from 'readline'

import { getAllFiles } from './files'
import { UploadLogger } from './logger'

export const FIXES_HEADER = '# path=fixes\n'

export async function generateFixes(projectRoot: string): Promise<string> {
  // Fake out the UploaderArgs as they are not needed
  const allFiles = await getAllFiles(projectRoot, projectRoot, {
    flags: '',
    slug: '',
    upstream: '',
  })

  const allAdjustments: string[] = []
  const EMPTYLINE = /^\s*$/mg
  // { or }
  const SYNTAXBRACKET = /^\s*[{}]\s*(\/\/.*)?$/m
  // [ or ]
  const SYNTAXLIST = /^\s*[[\]]\s*(\/\/.*)?$/m
  // //
  const SYNTAXCOMMENT = /^\s*\/\/.*$/m
  // /* or */
  const SYNTAXBLOCK = /^\s*(\/\*|\*\/).*$/m
  // func {
  const SYNTAXGOFUNC = /^\s*func.*\{\s*$/mg

  for (const file of allFiles) {
    let lineAdjustments: string[] = []

    if (
        file.match(/\.c$/) ||
        file.match(/\.cpp$/) ||
        file.match(/\.h$/) ||
        file.match(/\.hpp$/) ||
        file.match(/\.m$/) ||
        file.match(/\.swift$/) ||
        file.match(/\.vala$/)
    ) {
      lineAdjustments = await getMatchedLines(file, [EMPTYLINE, SYNTAXBRACKET])
    } else if (
        file.match(/\.php$/)
    ) {
      lineAdjustments = await getMatchedLines(file, [SYNTAXBRACKET, SYNTAXLIST])
    } else if (
        file.match(/\.go$/)
    ) {
      lineAdjustments = await getMatchedLines(file, [EMPTYLINE, SYNTAXCOMMENT, SYNTAXBLOCK, SYNTAXBRACKET, SYNTAXGOFUNC])
    } else if (
        file.match(/\.kt$/)
    ) {
      lineAdjustments = await getMatchedLines(file, [SYNTAXBRACKET, SYNTAXCOMMENT])
    }

    if (lineAdjustments.length > 0) {
      UploadLogger.verbose(`Matched file ${file} for adjustments: ${lineAdjustments.join(',')}`)
      allAdjustments.push(`${file}:${lineAdjustments.join(',')}\n`)
    }
  }
  return allAdjustments.join('')
}

async function getMatchedLines(file: string, matchers: RegExp[]): Promise<string[]> {
  const fileStream = fs.createReadStream(file)
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const matchedLines: string[] = []
  let lineNumber = 1

  for await (const line of rl) {
    for (const matcher of matchers) {
      if (line.match(matcher)) {
        matchedLines.push(lineNumber.toString())
        break
      }
    }
    lineNumber++
  }
  return matchedLines
}
