import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';
import type {AbstractIntlMessages} from 'next-intl';

// Can be imported from a shared config
export const locales = ['en', 'es'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  let messages: AbstractIntlMessages;
  try {
    // We'll load the main messages and merge home messages for now.
    // A full namespace solution might involve loading on demand.
    const mainMessages = (await import(`../messages/${locale}.json`)).default;
    const homeMessages = (await import(`../messages/home.${locale}.json`)).default;
    
    messages = {
        ...mainMessages,
        Home: homeMessages.Home // Add the Home namespace
    }

  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    notFound(); // Or handle differently, e.g., fallback to defaultLocale messages
  }
  
  return {
    locale,
    messages,
    timeZone: 'Europe/London' // Example, can be configured
  };
});
