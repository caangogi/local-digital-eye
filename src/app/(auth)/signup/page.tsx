import { SignUpForm } from "@/components/auth/SignUpForm";
import { ClientAuthForm } from "@/components/auth/ClientAuthForm";

export default function SignUpPage() {
  return (
    <ClientAuthForm>
      <SignUpForm />
    </ClientAuthForm>
  );
}
