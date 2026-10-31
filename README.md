# BIZLINK — Phase 1

A Next.js 15 + Supabase starter for the BIZLINK social learning and networking platform.

## What's real in this starter
- Email/password signup, login and sign out using Supabase Auth
- Email confirmation callback
- Role-based onboarding (student, entrepreneur, creator, professional; multiple roles allowed)
- Personal dashboard cards based on selected roles
- Profile editing, protected routes and per-user database policies
- Responsive Aurora visual design (Syne, Space Grotesk, Bricolage Grotesque)

## Not yet implemented
Actual messaging, revision uploads, AI tutor, live calls, livestreaming, push notifications, reporting/moderation workflows, and robust age verification. The signup form currently collects date of birth and restricts the beta to adults (18+) with a database-side age check; this is self-reported age, not identity verification. Placeholder pages are clearly marked. **Do not open public registration to minors until child safety and moderation features are implemented.**

## Run locally
1. Install Node.js 20+.
2. Run `npm install`.
3. Create a Supabase project at https://supabase.com/dashboard.
4. Open the SQL Editor and run `supabase/schema.sql`.
5. Copy `.env.example` to `.env.local`; replace values with your Supabase Project URL and **publishable/anon** key (never a service-role key).
6. In Supabase Auth → URL Configuration, set Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` to redirect URLs.
7. Enable email authentication in Supabase. For development, configure an email provider or test with an allowed address; hosted email delivery has limits.
8. Run `npm run dev` and visit http://localhost:3000.
9. Sign up, confirm email if required, complete onboarding, and open your dashboard.

## Deployment
Deploy to **Netlify**: import this repository, use `npm run build` (Netlify detects Next.js), set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Netlify environment variables, then update Supabase Auth Site URL and allowed redirect URLs to `https://YOUR-NETLIFY-DOMAIN.netlify.app` and `https://YOUR-NETLIFY-DOMAIN.netlify.app/auth/callback`. Configure production email delivery and security policies before inviting users.

## Security notes
- The middleware checks sessions using `getUser()`, not just untrusted local session data.
- Supabase RLS allows users to read and update only their own profile rows.
- The service-role key is not used anywhere in this app.
- Public profile discovery should be implemented separately, with consent and privacy rules.
- This is a starter, not a production security audit. Before launch add rate limits, anti-abuse measures, account recovery, monitoring, accessibility testing, privacy/legal policies and moderation.

## Age policy and roadmap
- This beta accepts **18+ only**, including adult university/college students. Date of birth is collected at signup and checked both in the UI and by the database signup trigger.
- Birth dates are stored separately in `public.account_age` with RLS enabled and no client read policies. Do not display them publicly.
- Self-reported birth dates are not strong age verification. Before admitting minors, implement age assurance appropriate to local laws, age-specific privacy defaults, parent/guardian consent where required, safe contact restrictions, reporting and staffed moderation, and a clear deletion/retention policy.
- This SQL is designed for a fresh project; if you've already deployed an earlier schema, review and apply changes carefully.
