import { LoginForm } from "@/components/auth/LoginForm";
import { ClientAuthForm } from "@/components/auth/ClientAuthForm";

export default function LoginPage() {
  return (
    <ClientAuthForm>
      <LoginForm />
    </ClientAuthForm>
  )
}
