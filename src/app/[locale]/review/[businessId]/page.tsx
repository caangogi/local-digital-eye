
import { notFound, redirect } from "next/navigation";

// This page is now obsolete and will redirect to the new public profile page.
export default async function LegacyPublicReviewPage({ params }: { params: { businessId: string, locale: string } }) {
    
    // Redirect to the new, richer business profile page.
    // The locale will be handled automatically by the navigation utilities.
    redirect(`/negocio/${params.businessId}`);

}
