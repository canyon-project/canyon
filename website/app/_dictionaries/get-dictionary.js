import 'server-only'

// We enumerate all dictionaries here for better linting and TypeScript support
// We also get the default import for cleaner types
const dictionaries = {
  en: () => import('./en'),
  cn: () => import('./cn'),
  ja: () => import('./ja'),
  ko: () => import('./ko'),
  fr: () => import('./fr'),
  hk: () => import('./hk'),
}

export async function getDictionary(locale) {
  const { default: dictionary } = await // @ts-expect-error -- fixme
  (dictionaries[locale] || dictionaries.en)()

  return dictionary
}

export function getDirection(locale) {
  return locale === 'es' ? 'rtl' : 'ltr'
}
