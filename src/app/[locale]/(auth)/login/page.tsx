import { LoginForm } from "@/components/auth/LoginForm";
import {getTranslations} from 'next-intl/server';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations('LoginForm');
  return {
    title: t('welcome')
  };
}

export default function LoginPage() {
  return <LoginForm />;
}
