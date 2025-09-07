import { SignUpForm } from "@/components/auth/SignUpForm";
import {getTranslations} from 'next-intl/server';
import { ClientAuthForm } from "@/components/auth/ClientAuthForm";

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations('AuthPage');
  return {
    title: t('signupTitle')
  };
}


export default function SignUpPage() {
  return (
    <ClientAuthForm>
      <SignUpForm />
    </ClientAuthForm>
  );
}
