import {
  createLocalizedPathnamesNavigation,
  Pathnames
} from 'next-intl/navigation';
import {locales as availableLocales, defaultLocale as defaultAvailableLocale} from './i18n';

export const locales = availableLocales;
export const defaultLocale = defaultAvailableLocale;
export const localePrefix = 'as-needed'; // Options: 'as-needed', 'always', 'never'

// Example pathnames for internationalization.
// If you have pages like `/about` and `/contact`, you can define their translations here.
export const pathnames = {
  '/': '/',
  '/dashboard': {
    en: '/dashboard',
    es: '/panel'
  },
  '/businesses': {
    en: '/businesses',
    es: '/negocios'
  },
  // Add more paths as needed
} satisfies Pathnames<typeof locales>;


export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({locales, localePrefix, pathnames});