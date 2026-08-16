# Planify

A modern, responsive launch website for Planify—an exploration platform that helps Indian students discover promising career directions, try real activities, and build a flexible roadmap.

## Run locally

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Clerk and Supabase setup

Planify uses Clerk for accounts and Supabase only for server-side early-access storage. The public landing page remains available without an account.

1. Copy `.env.example` to `.env.local`.
2. Add the Clerk publishable key and server-only secret key. Keep `CLERK_AUTHORIZED_PARTIES=http://localhost:3000` for local development.
3. Add the Supabase project URL and server-only secret key.
4. In the Supabase SQL Editor, run these migrations in order:
   - `supabase/migrations/20260817_create_early_access_signups.sql`
   - `supabase/migrations/20260818_add_clerk_user_identity.sql`

For a deployed environment, replace `CLERK_AUTHORIZED_PARTIES` with the exact public site origin. Multiple trusted origins can be supplied as a comma-separated list; never derive this allowlist from the incoming request.

The first migration creates a fresh private `early_access_signups` table, including its optional Clerk user ID, constraints, indexes, row-level security, and revoked browser roles. The second migration is idempotent and upgrades a table created before Clerk was introduced by adding the Clerk identity column, constraint, and index. It is safe to run both for a fresh setup.

`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is intentionally available to the browser. `CLERK_SECRET_KEY` and `SUPABASE_SECRET_KEY` are server-only and must never use a `NEXT_PUBLIC_` or `VITE_` prefix. `SUPABASE_URL` is also consumed only by the server route in this project.

Before production, rotate any server key that has been shared in chat or another message, then place the replacement directly in `.env.local` or the deployment secret manager. Do not paste replacement secrets into source code, commits, screenshots, or chat.

The header mounts Clerk's modal sign-in and account controls. When a signed-in visitor submits the early-access form, the browser attaches a short-lived Clerk session token. The API verifies that token with `@clerk/backend`, checks it against `CLERK_AUTHORIZED_PARTIES`, and associates the Clerk user ID only when the account's primary email matches the submitted email. Anonymous enquiries are still accepted.

## Admin panel

The private admin panel is available at `http://localhost:3000/admin`. It shows the saved email, audience, school name, account connection, and submission date, with search, audience filtering, totals, and a manual refresh action.

Admin access uses a deny-by-default Clerk allowlist:

1. Create or sign in to the Clerk account that should be the administrator.
2. In **Clerk Dashboard → Users**, copy that account's User ID.
3. Add it to `ADMIN_CLERK_USER_IDS` in `.env.local`. Multiple administrator IDs can be comma-separated.
4. Restart the local site and open `/admin`.

The browser never receives the Supabase secret or Clerk secret. The admin API verifies the Clerk session and administrator allowlist on every request, then returns a read-only list capped at 500 recent enquiries.

Supabase authentication is not used. The API performs the database insert with the server-only Supabase secret, while row-level security and revoked `anon` and `authenticated` privileges prevent direct browser access to the table.

Before exposing the endpoint publicly, add a durable edge rate limit or a managed challenge such as Cloudflare Turnstile. The local endpoint already enforces same-origin requests, strict validation, a body-size cap, and a honeypot, but those controls are not a substitute for production abuse protection.

## Validate

```bash
npm run lint
npm run build
node --test tests/rendered-html.test.mjs
```

## What is included

- Responsive, single-page product narrative for students, parents, and schools
- Animated product preview, exploration loop, and six-week roadmap
- Transparent recommendation and privacy principles
- Accessible navigation, controls, focus states, and reduced-motion support
- Dynamic Open Graph and Twitter metadata with a custom social card
- Interactive audience views, mobile menu, FAQ, and persistent early-access form
- Clerk modal sign-in, session-aware UI, and account management
- Clerk session verification with an explicit authorized-party allowlist
- A server-only Supabase write route with validation and duplicate-safe responses
- A Clerk-protected, read-only admin panel for reviewing early-access enquiries
