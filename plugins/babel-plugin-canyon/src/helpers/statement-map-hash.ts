import { computeHash, type HashAlgorithm, type HashDigest } from './hash'

type Position = { line: number; column: number }
type StatementLoc = { start: Position; end: Position; [key: string]: any }
type FunctionLoc = { name?: string; decl?: { start: Position; end: Position }; loc?: { start: Position; end: Position }; line?: number; [key: string]: any }

export function enrichStatementMapWithHash(
  statementMap: Record<string, StatementLoc>,
  fullCode: string,
  options?: { debug?: boolean; algorithm?: HashAlgorithm; digest?: HashDigest },
): void {
  if (!statementMap || typeof statementMap !== 'object') return
  const lines = String(fullCode || '').split('\n')

  const getSnippetByLoc = (start: Position, end: Position): string => {
    if (!start || !end) return ''
    const startLine = Math.max(1, Number(start.line) || 1) - 1
    const endLine = Math.max(1, Number(end.line) || 1) - 1
    const startCol = Math.max(0, Number(start.column) || 0)
    const endCol = Math.max(0, Number(end.column) || 0)

    if (startLine > endLine) return ''
    if (startLine === endLine) {
      const line = lines[startLine] || ''
      return line.slice(startCol, endCol)
    }

    const parts: string[] = []
    const firstLine = lines[startLine] || ''
    parts.push(firstLine.slice(startCol))
    for (let i = startLine + 1; i < endLine; i++) {
      parts.push(lines[i] || '')
    }
    const lastLine = lines[endLine] || ''
    parts.push(lastLine.slice(0, endCol))
    return parts.join('\n')
  }

  const algorithm = options?.algorithm || 'sha1'
  const digest = options?.digest || 'hex'

  const isValidPos = (p?: Position) => p && typeof p.line === 'number' && typeof p.column === 'number'
  const earlierOf = (a: Position, b: Position): Position => {
    if (a.line < b.line) return a
    if (a.line > b.line) return b
    return a.column <= b.column ? a : b
  }
  const laterOf = (a: Position, b: Position): Position => {
    if (a.line > b.line) return a
    if (a.line < b.line) return b
    return a.column >= b.column ? a : b
  }

  Object.keys(statementMap).forEach((key) => {
    const loc = statementMap[key]
    if (loc && loc.start && loc.end) {
      const content = getSnippetByLoc(loc.start, loc.end)
      const hash = computeHash(content, algorithm, digest)
      if (options && options.debug) {
        console.log(hash, 'hash')
      }
      try {
        statementMap[key].contentHash = hash
        // statementMap[key].content = content
      } catch (e) {
        // ignore
      }
    }
  })
}


export function enrichFnMapWithHash(
  fnMap: Record<string, FunctionLoc>,
  fullCode: string,
  options?: { debug?: boolean; algorithm?: HashAlgorithm; digest?: HashDigest },
): void {
  if (!fnMap || typeof fnMap !== 'object') return
  const lines = String(fullCode || '').split('\n')

  const getSnippetByLoc = (start: Position, end: Position): string => {
    if (!start || !end) return ''
    const startLine = Math.max(1, Number(start.line) || 1) - 1
    const endLine = Math.max(1, Number(end.line) || 1) - 1
    const startCol = Math.max(0, Number(start.column) || 0)
    const endCol = Math.max(0, Number(end.column) || 0)

    if (startLine > endLine) return ''
    if (startLine === endLine) {
      const line = lines[startLine] || ''
      return line.slice(startCol, endCol)
    }

    const parts: string[] = []
    const firstLine = lines[startLine] || ''
    parts.push(firstLine.slice(startCol))
    for (let i = startLine + 1; i < endLine; i++) {
      parts.push(lines[i] || '')
    }
    const lastLine = lines[endLine] || ''
    parts.push(lastLine.slice(0, endCol))
    return parts.join('\n')
  }

  const algorithm = options?.algorithm || 'sha1'
  const digest = options?.digest || 'hex'

  const isValidPos = (p?: Position) => p && typeof p.line === 'number' && typeof p.column === 'number'
  const earlierOf = (a: Position, b: Position): Position => {
    if (a.line < b.line) return a
    if (a.line > b.line) return b
    return a.column <= b.column ? a : b
  }
  const laterOf = (a: Position, b: Position): Position => {
    if (a.line > b.line) return a
    if (a.line < b.line) return b
    return a.column >= b.column ? a : b
  }

  Object.keys(fnMap).forEach((key) => {
    const info = fnMap[key]
    const hasLoc = info && info.loc && isValidPos(info.loc.start) && isValidPos(info.loc.end)
    const hasDecl = info && info.decl && isValidPos(info.decl.start) && isValidPos(info.decl.end)

    let start: Position | undefined
    let end: Position | undefined

    if (hasLoc && hasDecl) {
      start = earlierOf(info.decl.start as Position, info.loc.start as Position)
      end = laterOf(info.decl.end as Position, info.loc.end as Position)
    } else if (hasLoc) {
      start = info.loc.start as Position
      end = info.loc.end as Position
    } else if (hasDecl) {
      start = info.decl.start as Position
      end = info.decl.end as Position
    }

    if (start && end) {
      const content = getSnippetByLoc(start, end)
      const hash = computeHash(content, algorithm, digest)
      if (options && options.debug) {
        console.log(hash, 'fnHash')
      }
      try {
        fnMap[key].contentHash = hash
        // fnMap[key].content = content
      } catch (e) {
        // ignore
      }
    }
  })
}


