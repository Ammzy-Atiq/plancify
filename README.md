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

## Clerk, Supabase, AI, and admin setup

Signed-in student workspaces, enquiries, and the admin panel use the application backend. Guest exploration still works locally in the browser.

1. Copy `.env.example` to `.env.local`.
2. Configure the Clerk publishable key, server secret, exact `CLERK_AUTHORIZED_PARTIES`, and either `ADMIN_CLERK_USER_IDS` or `ADMIN_EMAILS`.
3. Configure the server-only Supabase URL and secret.
4. Set `RATE_LIMIT_SALT` to a long random server secret.
5. In the Supabase SQL Editor, paste and run `supabase/plancify_mvp_schema.sql`. It contains the complete, rerunnable MVP schema, server-only grants, and durable API rate limiter.
6. Optionally configure one or more AI providers: `OPENAI_API_KEY`, `GEMINI_API_KEY`, and `ANTHROPIC_API_KEY`. Set each matching `*_MODEL` variable to any model ID supported by that provider.
7. Open `/admin` and sign in with an allowlisted Clerk user.

For deployment, add the same variables to the hosting provider. Set `CLERK_AUTHORIZED_PARTIES` to a comma-separated list of exact origins, for example `http://localhost:3000,https://problem-the-indian-education-system.vercel.app`. Do not include paths or a trailing slash. The Clerk dashboard must also allow the production origin.

### Backend behavior

- Guests can explore with device-local progress and do not enter a fake password.
- Clerk-authenticated students load and save one Supabase workspace keyed by their verified Clerk user ID.
- Family and school forms upsert into `early_access_signups`, so a repeated submission refreshes the stored details without creating duplicates.
- `/admin` verifies the Clerk session and server-side administrator allowlist before returning enquiries or student progress.
- The enquiry, workspace, admin, and AI routes are throttled. Supabase provides the durable counter; an in-memory guard protects an individual server instance if the counter is temporarily unavailable.
- The guide always has a local response. Configure `AI_PROVIDER_ORDER` with any order of `openai`, `gemini`, and `anthropic` (the aliases `google` and `claude` also work). The server tries only providers with keys, one at a time, and fails over to the next provider before using the local response. `AI_PROVIDER_TIMEOUT_MS` is clamped between 3 and 15 seconds per provider.
- Model IDs are server-controlled through `OPENAI_MODEL`, `GEMINI_MODEL`, and `ANTHROPIC_MODEL`; students cannot choose an expensive model from the browser.

Never expose `CLERK_SECRET_KEY` or `SUPABASE_SECRET_KEY` to browser code. Rotate any server secret that has been pasted into chat or another message before production use.

## Validate

```bash
npm run lint
npm test
```

The regression suite builds the production app, verifies every demo route, checks the local-first discovery experience, validates the protected admin/API behavior, and scans the client output for server-secret leakage.
