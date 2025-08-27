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
  matcher: [
    // Match all pathnames except for
    // - …if they start with `/api`, `/_next` or `/_vercel`
    // - …the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
