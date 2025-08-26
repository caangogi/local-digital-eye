import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './navigation';

export default createMiddleware({
  // A list of all locales that are supported
  locales,
  // Used when no locale matches
  defaultLocale,
  // Always use a locale prefix
  localePrefix: 'as-needed',
  pathnames: {
    '/': '/',
    '/login': '/login',
    '/dashboard': '/dashboard',
    '/businesses': '/businesses',
    '/reports': '/reports',
    '/map-search': '/map-search',
    '/service-recommendations': '/service-recommendations',
    '/settings': '/settings',
    '/road-map': '/road-map'
  }
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - …if they start with `/api`, `/_next` or `/_vercel`
    // - …the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
