// This page has been replaced by Clerk authentication.
// Redirects to /sign-in for backward compatibility.

import { redirect } from 'next/navigation';

export default function LegacyLoginPage() {
  redirect('/sign-in');
}
