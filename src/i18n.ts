
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
    // Load all messages from a single file per locale.
    const mainMessages = (await import(`../messages/${locale}.json`)).default;
    const homeMessages = (await import(`../messages/home.${locale}.json`)).default;
    const onboardingMessages = (await import(`../messages/onboarding.${locale}.json`)).default;

    // Merge all message namespaces into one object.
    messages = {
        ...mainMessages,
        Home: homeMessages.Home,
        OnboardingPage: onboardingMessages.OnboardingPage,
    }

  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    notFound();
  }
  
  return {
    locale,
    messages,
    timeZone: 'Europe/London'
  };
});
