import { LoginForm } from "@/components/auth/LoginForm";
import {getTranslations} from 'next-intl/server';
import { ClientAuthForm } from "@/components/auth/ClientAuthForm";

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations('AuthPage');
  return {
    title: t('loginTitle')
  };
}

export default function LoginPage() {
  return (
    <ClientAuthForm>
      <LoginForm />
    </ClientAuthForm>
  )
}
