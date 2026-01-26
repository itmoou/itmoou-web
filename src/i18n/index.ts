import { ko } from './ko'
import { en } from './en'

export type Language = 'ko' | 'en'

export const translations = {
  ko,
  en
}

export function getTranslation(lang: Language) {
  return translations[lang] || translations.ko
}

export function getLanguageFromPath(path: string): Language {
  if (path.startsWith('/en')) {
    return 'en'
  }
  return 'ko'
}

export function getLocalizedPath(path: string, lang: Language): string {
  // Remove existing language prefix
  const cleanPath = path.replace(/^\/(en|ko)/, '') || '/'
  
  // Add language prefix for non-Korean
  if (lang === 'en') {
    return `/en${cleanPath === '/' ? '' : cleanPath}`
  }
  
  return cleanPath
}
