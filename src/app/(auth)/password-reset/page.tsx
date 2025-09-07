import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { ClientAuthForm } from "@/components/auth/ClientAuthForm";

export default function PasswordResetPage() {
  return (
    <ClientAuthForm>
      <PasswordResetForm />
    </ClientAuthForm>
  );
}
