import childprocess from 'child_process'
import { SPAWNPROCESSBUFFERSIZE } from './constants'


export function isProgramInstalled(programName: string): boolean {
  return !childprocess.spawnSync(programName).error
}

export function runExternalProgram(
  programName: string,
  optionalArguments: string[] = [],
): string {
  const result = childprocess.spawnSync(
    programName,
    optionalArguments,
    { maxBuffer: SPAWNPROCESSBUFFERSIZE },
  )
  if (result.error) {
    throw new Error(`Error running external program: ${result.error}`)
  }
  return result.stdout.toString().trim()
}

export function isSetAndNotEmpty(val: string | undefined): boolean {
  return typeof val !== 'undefined' && val !== ''
}

export function argAsArray<T>(args?: T | T[]): T[] {
  const result: T[] = []
  if (typeof args === "undefined") {
    return result
  }
  return result.concat(args)
}

export function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
