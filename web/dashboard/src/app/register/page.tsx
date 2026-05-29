// This page has been replaced by Clerk authentication.
// Redirects to /sign-up for backward compatibility.

import { redirect } from 'next/navigation';

export default function LegacyRegisterPage() {
  redirect('/sign-up');
}
