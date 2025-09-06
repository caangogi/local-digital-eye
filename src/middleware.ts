import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale, pathnames} from './navigation';

export default createMiddleware({
  // A list of all locales that are supported
  locales,
  // Used when no locale matches
  defaultLocale,
  // Make the middleware aware of the path translations
  pathnames,
  // Always use a locale prefix
  localePrefix: 'as-needed'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
