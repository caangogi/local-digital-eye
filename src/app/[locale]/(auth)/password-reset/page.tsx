import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import {getTranslations} from 'next-intl/server';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations('AuthPage');
  return {
    title: t('passwordReset.title')
  };
}

export default function PasswordResetPage() {
  return <PasswordResetForm />;
}
