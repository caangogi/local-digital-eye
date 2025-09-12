
import { redirect } from 'next/navigation';

// This page is now obsolete and has been integrated into the main dashboard.
// We redirect any old bookmarks or direct access to the new, centralized dashboard.
export default async function MyBusinessPage() {
    redirect('/dashboard');
}
