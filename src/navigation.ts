
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
  '/': '/', // Explicitly map the root path
  '/login': {
    en: '/login',
    es: '/iniciar-sesion'
  },
  '/signup': {
    en: '/signup',
    es: '/registro'
  },
  '/password-reset': {
    en: '/password-reset',
    es: '/restablecer-contrasena'
  },
  '/dashboard': {
    en: '/dashboard',
    es: '/panel'
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
  '/road-map': {
    en: '/road-map',
    es: '/hoja-de-ruta'
  },
  // This is a dynamic route, we need to specify the slug part
  '/negocio/[businessId]': {
    en: '/business/[businessId]',
    es: '/negocio/[businessId]'
  },
  '/dev/crm-road-map': {
    en: '/dev/crm-road-map',
    es: '/dev/crm-hoja-de-ruta'
  },
  '/dev/my-bussiness-road-map': {
    en: '/dev/my-bussiness-road-map',
    es: '/dev/mi-negocio-hoja-de-ruta'
  }
} satisfies Pathnames<typeof locales>;


export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({locales, localePrefix, pathnames});

    