
import {
  createLocalizedPathnamesNavigation,
  Pathnames
} from 'next-intl/navigation';
import {locales as availableLocales, defaultLocale as defaultAvailableLocale} from './i18n';

export const locales = availableLocales;
export const defaultLocale = defaultAvailableLocale;
export const localePrefix = 'as-needed';

// The pathnames object holds the mappings from a canonical path
// to locale-specific paths. This is used to translate URLs.
export const pathnames = {
  '/': '/', 
  
  // Auth routes are not internationalized, but we define them
  // so that the Link component can work without a locale.
  // The middleware will skip adding a locale prefix for these.
  '/login': '/login',
  '/signup': '/signup',
  '/password-reset': '/password-reset',
  
  '/dashboard': {
    en: '/dashboard',
    es: '/dashboard'
  },
  '/businesses': {
    en: '/businesses',
    es: '/businesses'
  },
   '/businesses/add': {
    en: '/businesses/add',
    es: '/businesses/add'
  },
  '/reports': {
    en: '/reports',
    es: '/reports'
  },
   '/map-search': {
    en: '/map-search',
    es: '/map-search'
  },
  '/service-recommendations': {
    en: '/service-recommendations',
    es: '/service-recommendations'
  },
  '/settings': {
    en: '/settings',
    es: '/settings'
  },
   '/settings/users': {
    en: '/settings/users',
    es: '/settings/users'
  },
  '/settings/billing': {
    en: '/settings/billing',
    es: '/settings/billing'
  },
  // This is a dynamic route, we need to specify the slug part
  '/negocio/[businessId]': {
    en: '/business/[businessId]',
    es: '/negocio/[businessId]'
  },
  '/dev/my-bussiness-road-map': {
    en: '/dev/my-bussiness-road-map',
    es: '/dev/my-bussiness-road-map'
  },
  '/onboarding': {
    en: '/onboarding',
    es: '/onboarding'
  },
   '/mi-negocio': {
    en: '/my-business',
    es: '/mi-negocio'
  },
} satisfies Pathnames<typeof locales>;


export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({locales, localePrefix, pathnames});

    
    

    