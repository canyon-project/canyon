import validator from 'validator'

/**
 *
 * @param {string} token
 * @returns boolean
 */
export function validateToken(token: string): boolean {
  // TODO: this should be refactored to check against format and length
  return validator.isAlphanumeric(token) || validator.isUUID(token)
}

export function validateURL(url: string): boolean {
  return validator.isURL(url, { require_protocol: true })
}

export function isValidFlag(flag: string): boolean {
  // eslint-disable-next-line no-useless-escape
  const mask = /^[\w\.\-]{1,45}$/
  return flag.length === 0 || mask.test(flag)
}

export function validateFlags(flags: string[]): void {
  const invalidFlags = flags.filter(flag => isValidFlag(flag) !== true)

  if (invalidFlags.length > 0) {
    throw new Error(
      `Flags must consist only of alphanumeric characters, '_', '-', or '.' and not exceed 45 characters. Received ${flags}`,
    )
  }
}

/**
 * Validate that a SHA is the correct length and content
 * @param {string} commitSHA
 * @param {number} requestedLength
 * @returns {boolean}
 */
const GIT_SHA_LENGTH = 40

export function validateSHA(
  commitSHA: string,
  requestedLength = GIT_SHA_LENGTH,
): boolean {
  return (
    commitSHA.length === requestedLength && validator.isAlphanumeric(commitSHA)
  )
}

export function checkSlug(slug: string): boolean {
  if (slug !== '' && !slug.match(/\//)) {
    return false
  }
  return true
}
