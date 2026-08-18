# Plancify

Plancify is an interactive career-exploration and skill-building prototype for Indian school students in Classes 6–12. It helps a student discover what fits, choose a direction, receive a class-aware roadmap, practise relevant skills, and collect proof of progress.

The core product is designed for a reliable 90-second competition demo. Discovery, recommendations, progress, chat responses, and student data all run from local mock state—no live API, AI service, account, or database is required.

## Run locally

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Presentation paths

Full journey:

1. `/` — product story and starting point
2. `/onboarding` — six-question discovery flow
3. `/results` — rules-based three-career shortlist
4. `/goal` — celebratory goal confirmation
5. `/dashboard` — populated student home
6. `/roadmap` → `/skills` → `/weekly-plan` → `/portfolio`

Fast path: open `/login` and choose **Continue as Demo Student**. This goes straight to the fully populated dashboard.

## Product routes

- `/dashboard` — current goal, progress, weekly actions, skills, portfolio, and streak
- `/roadmap` — Class 8 through Class 12 staged plan
- `/skills` — five-level skill tracker with next-level requirements
- `/weekly-plan` — three completable weekly actions and progress feedback
- `/portfolio` — seeded proof of projects, competitions, and certificates
- `/competitions` — filterable competition calendar
- `/resources` — career-specific curated learning resources
- `/community` — field-based groups and recent posts
- `/mentors` — mentor directory with mock connection actions
- `/for-schools` — school licensing and pilot-program page

Every logged-in-style product route uses the same persistent sidebar and goal-aware local AI Chat Guide.

## Design direction

- Near-black marketing surfaces with solid purple and lime brand accents
- Warm off-white, lavender, and bright card surfaces inside the student product
- Rounded display typography, readable body copy, generous spacing, and large targets
- Card, progress, toast, selection, and page-entry micro-interactions
- No CSS gradients; reduced-motion and keyboard-focus support are included

## Optional Clerk, Supabase, and admin setup

The competition demo does not require a backend. The existing early-access API and read-only admin panel remain available as an optional, separate system.

1. Copy `.env.example` to `.env.local`.
2. Configure the Clerk publishable key, server secret, exact `CLERK_AUTHORIZED_PARTIES`, and `ADMIN_CLERK_USER_IDS`.
3. Configure the server-only Supabase URL and secret.
4. Run these Supabase migrations in order:
   - `supabase/migrations/20260817_create_early_access_signups.sql`
   - `supabase/migrations/20260818_add_clerk_user_identity.sql`
5. Open `/admin` and sign in with an allowlisted Clerk user.

Never expose `CLERK_SECRET_KEY` or `SUPABASE_SECRET_KEY` to browser code. Rotate any server secret that has been pasted into chat or another message before production use.

## Validate

```bash
npm run lint
npm test
```

The regression suite builds the production app, verifies every demo route, checks the local-first discovery experience, validates the protected admin/API behavior, and scans the client output for server-secret leakage.
