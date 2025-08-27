import { SignUpForm } from "@/components/auth/SignUpForm";
import {getTranslations} from 'next-intl/server';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations('AuthPage');
  return {
    title: t('signupTitle')
  };
}

export default function SignUpPage() {
  return <SignUpForm />;
}
