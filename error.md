Authentication Setup Instructions for SMSHive

Use Clerk as the complete authentication provider for SMSHive.

Requirements:

1. Use Clerk for:

   * User registration
   * User login
   * Session management
   * Password reset
   * Email verification
   * User profile management
   * Protected routes
   * JWT/session validation

2. For the current MVP version:

   * Enable Email + Password authentication only.
   * Disable or hide all social login buttons.
   * Do NOT require Google OAuth.
   * Do NOT require GitHub OAuth.
   * Do NOT require Apple OAuth.
   * Do NOT request GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.
   * Do NOT block deployment if social providers are not configured.

3. UI Requirements:

   * Show Sign Up page.
   * Show Sign In page.
   * Show Forgot Password flow.
   * Show Email Verification flow.
   * Show User Profile page.
   * Show Logout functionality.

4. Route Protection:

   * Unauthenticated users should be redirected to Sign In.
   * Authenticated users should access dashboard routes normally.
   * Protect all user-specific pages using Clerk middleware.

5. Environment Variables:
   Only require:
   CLERK_PUBLISHABLE_KEY
   CLERK_SECRET_KEY

   Social provider environment variables must remain optional.

6. Future Extensibility:
   Build the authentication system so Google, GitHub, and Apple login can be enabled later from the Clerk Dashboard without requiring major code changes.

7. Error Handling:

   * Show clear authentication errors.
   * Handle expired sessions gracefully.
   * Handle email verification failures.
   * Handle password reset failures.

Goal:
Create a production-ready Clerk authentication system using only Email + Password authentication for now. Social logins will be added later and must not be required for the application to function.
