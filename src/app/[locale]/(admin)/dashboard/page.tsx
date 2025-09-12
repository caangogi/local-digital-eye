
import { getTranslations } from "next-intl/server";
import { getOwnedBusiness } from "@/actions/business.actions";
import { AdminDashboard } from "./_components/AdminDashboard";
import { OwnerDashboard } from "./_components/OwnerDashboard";
import { SuperAdminButton } from "./_components/SuperAdminButton";

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations('AppSidebar'); 
  return {
    title: t('dashboard')
  };
}

// This is now a SERVER COMPONENT
export default async function DashboardPage() {
    const ownedBusiness = await getOwnedBusiness();

    // The user's role is not directly available in a Server Component without a session lookup.
    // However, the logic here is role-based on data: if an owned business exists, show owner dashboard.
    // If not, it implies they are an admin (or a user with no business yet).

    return (
        <div className="flex flex-col gap-6">
            <SuperAdminButton />
            {ownedBusiness ? (
                <OwnerDashboard business={ownedBusiness} />
            ) : (
                <AdminDashboard />
            )}
        </div>
    );
}
