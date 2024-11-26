/**
 *  We really only need three log levels
 * * Error
 * * Info
 * * Verbose
 */

function _getTimestamp() {
  return new Date().toISOString()
}

/**
 *
 * @param {string} message - message to log
 * @param {boolean} shouldVerbose - value of the verbose flag
 * @return void
 */
export function verbose(message: string, shouldVerbose: boolean): void {
  if (shouldVerbose === true) {
    console.debug(`[${_getTimestamp()}] ['verbose'] ${message}`)
  }
}

/**
 *
 * @param {string} message - message to log
 * @return void
 */
export function logError(message: string): void {
  console.error(`[${_getTimestamp()}] ['error'] ${message}`)
}

/**
 *
 * @param {string} message - message to log
 * @return void
 */
export function info(message: string): void {
  console.log(`[${_getTimestamp()}] ['info'] ${message}`)
}

export class UploadLogger {
  private static _instance: UploadLogger
  logLevel = 'info'

  private constructor() {
    // Intentionally empty
  }

  static getInstance(): UploadLogger {
    if (!UploadLogger._instance) {
      UploadLogger._instance = new UploadLogger()
    }
    return UploadLogger._instance;
  }

  static setLogLevel(level: string) {
    UploadLogger.getInstance().logLevel = level
  }

  static verbose(message: string) {
    verbose(message, UploadLogger.getInstance().logLevel === 'verbose')
  }
}
