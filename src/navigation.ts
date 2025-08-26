import {
  createLocalizedPathnamesNavigation,
  Pathnames
} from 'next-intl/navigation';
import {locales as availableLocales, defaultLocale as defaultAvailableLocale} from './i18n';

export const locales = availableLocales;
export const defaultLocale = defaultAvailableLocale;
export const localePrefix = 'as-needed'; // Options: 'as-needed', 'always', 'never'

// The pathnames object holds the mappings from a canonical path
// to locale-specific paths.
export const pathnames = {
  // If all locales use the same pathname, a single
  // external path can be used for all locales.
  '/': '/',
  '/login': '/login',
  '/dashboard': '/dashboard',
  '/businesses': '/businesses',
  '/reports': '/reports',
  '/map-search': '/map-search',
  '/service-recommendations': '/service-recommendations',
  '/settings': '/settings',
  '/road-map': '/road-map'
} satisfies Pathnames<typeof locales>;


export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({locales, localePrefix, pathnames});
