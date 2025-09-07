
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
    es: '/negocios'
  },
   '/businesses/add': {
    en: '/businesses/add',
    es: '/negocios/anadir'
  },
  '/reports': {
    en: '/reports',
    es: '/informes'
  },
   '/map-search': {
    en: '/map-search',
    es: '/mapa-de-cartera'
  },
  '/service-recommendations': {
    en: '/service-recommendations',
    es: '/recomendaciones-ia'
  },
  '/settings': {
    en: '/settings',
    es: '/configuracion'
  },
  // This is a dynamic route, we need to specify the slug part
  '/negocio/[businessId]': {
    en: '/business/[businessId]',
    es: '/negocio/[businessId]'
  },
  '/dev/my-bussiness-road-map': {
    en: '/dev/my-bussiness-road-map',
    es: '/dev/my-bussiness-road-map'
  }
} satisfies Pathnames<typeof locales>;


export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({locales, localePrefix, pathnames});

    
    
