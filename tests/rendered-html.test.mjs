import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { access, readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const nextCli = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url),
);
const testPort = 31_000 + (process.pid % 1_000);
const baseUrl = `http://127.0.0.1:${testPort}`;
let server;
let serverOutput = "";

before(async () => {
  server = spawn(
    process.execPath,
    [nextCli, "start", "-H", "127.0.0.1", "-p", String(testPort)],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        NODE_ENV: "production",
        NEXT_TELEMETRY_DISABLED: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (chunk) => {
    serverOutput += chunk;
  });
  server.stderr.on("data", (chunk) => {
    serverOutput += chunk;
  });

  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Next.js exited before becoming ready.\n${serverOutput}`);
    }

    try {
      const response = await fetch(baseUrl, { redirect: "manual" });
      if (response.status > 0) return;
    } catch {
      // The server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Timed out waiting for Next.js.\n${serverOutput}`);
}, { timeout: 35_000 });

after(async () => {
  if (!server || server.exitCode !== null) return;
  server.kill();
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ]);
});

async function requestApp(path = "/", init) {
  return fetch(`${baseUrl}${path}`, init);
}

async function collectTextFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
      if (entry.isDirectory()) return collectTextFiles(path);
      if (!/\.(?:js|css|html|map)$/i.test(entry.name)) return "";
      return readFile(path, "utf8");
    }),
  );
  return files.flat(Infinity).join("\n");
}

test("server-renders the complete Plancify landing page and demo routes", async () => {
  const response = await requestApp("/", {
    headers: { accept: "text/html" },
  });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Plancify - Better decisions start with better exploration\.<\/title>/i);
  assert.match(html, /Figure out what you actually want to be\./);
  assert.match(html, /Starting now, not in Class 12\./);
  assert.match(html, /id="how-it-works"/);
  assert.match(html, /id="features"/);
  assert.match(html, /How Plancify works/);
  assert.match(html, /Skill Tracker/);
  assert.match(html, /Weekly Action Plan/);
  assert.match(html, /Portfolio Builder/);
  assert.match(html, /Competition Calendar/);
  assert.match(html, /AI Chat Guide/);
  assert.match(html, /href="\/onboarding"/);
  assert.match(html, /href="\/dashboard"/);
  assert.match(html, /No student data is collected in the demo/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /\/og\.png/);
  assert.doesNotMatch(html, /react-loading-skeleton|Building your site/i);

  const demoRoutes = [
    "/login",
    "/onboarding",
    "/results",
    "/goal",
    "/dashboard",
    "/roadmap",
    "/skills",
    "/weekly-plan",
    "/portfolio",
    "/competitions",
    "/resources",
    "/community",
    "/mentors",
    "/for-schools",
  ];
  for (const path of demoRoutes) {
    const routeResponse = await requestApp(path, { headers: { accept: "text/html" } });
    assert.equal(routeResponse.status, 200, `${path} should render`);
    assert.match(routeResponse.headers.get("content-type") ?? "", /^text\/html\b/i);
  }
});

test("keeps the Plancify experience complete, accessible, local-first, and starter-free", async () => {
  const [
    css,
    page,
    layout,
    packageJson,
    route,
    demoProvider,
    appShell,
    demoData,
    onboardingPage,
    resultsPage,
    dashboardPage,
    competitionsPage,
    adminPage,
    adminLayout,
    adminRoute,
    adminCss,
    initialMigration,
    clerkIdentityMigration,
    envExample,
  ] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/api/early-access/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/demo-provider.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/app-shell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/demo-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/onboarding/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/results/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/competitions/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/early-access/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/admin.module.css", import.meta.url), "utf8"),
    readFile(new URL("../supabase/migrations/20260817_create_early_access_signups.sql", import.meta.url), "utf8"),
    readFile(new URL("../supabase/migrations/20260818_add_clerk_user_identity.sql", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Career planning for Classes 6-12/);
  assert.match(page, /Exploration before commitment/);
  assert.match(layout, /<DemoProvider>\{children\}<\/DemoProvider>/);
  assert.match(demoProvider, /toggleTask/);
  assert.match(demoProvider, /addPortfolioItem/);
  assert.match(appShell, /\/weekly-plan/);
  assert.match(appShell, /\/competitions/);
  assert.match(appShell, /AI Chat Guide/);
  assert.match(appShell, /What should I do next\?/);
  assert.match(demoData, /Software Engineer/);
  assert.match(demoData, /UX \/ Product Designer/);
  assert.match(demoData, /Robotics Engineer/);
  assert.match(onboardingPage, /Which of these sound most fun to you\?/);
  assert.match(onboardingPage, /Which subjects do you enjoy most\?/);
  assert.match(onboardingPage, /Which subjects do you enjoy least\?/);
  assert.match(onboardingPage, /Have you already been thinking about a career\?/);
  assert.match(onboardingPage, /How do you like to learn\?/);
  assert.match(onboardingPage, /What class are you in\?/);
  assert.match(resultsPage, /Choose this goal/);
  assert.match(dashboardPage, /This week/i);
  assert.match(dashboardPage, /Your portfolio is taking shape/);
  assert.match(competitionsPage, /Robotics/);
  assert.match(competitionsPage, /Medicine/);
  assert.doesNotMatch(
    demoProvider + appShell + demoData + onboardingPage + resultsPage + dashboardPage + competitionsPage,
    /fetch\(|axios|XMLHttpRequest/,
  );
  assert.match(adminPage, /fetch\("\/api\/admin\/early-access"/);
  assert.match(adminPage, /Search email or school/);
  assert.match(adminPage, /Every enquiry, in one clear view/);
  assert.match(adminLayout, /index:\s*false/);
  assert.match(adminLayout, /images:\s*\[\]/);
  assert.match(adminRoute, /ADMIN_CLERK_USER_IDS/);
  assert.match(adminRoute, /authenticateRequest\(request/);
  assert.match(adminRoute, /\.select\("id,email,audience,school_name,source,clerk_user_id,created_at"\)/);
  assert.match(adminRoute, /\.limit\(500\)/);
  assert.doesNotMatch(adminPage + adminCss, /CLERK_SECRET_KEY|SUPABASE_SECRET_KEY|sb_secret_|sk_(?:test|live)_/);
  assert.doesNotMatch(adminCss, /(?:linear|radial|conic)-gradient\s*\(/i);
  assert.match(route, /SUPABASE_SECRET_KEY/);
  assert.match(route, /createClerkClient/);
  assert.match(route, /CLERK_SECRET_KEY/);
  assert.match(route, /CLERK_AUTHORIZED_PARTIES/);
  assert.match(route, /authenticateRequest\(request/);
  assert.match(route, /acceptsToken:\s*"session_token"/);
  assert.match(route, /requestState\.toAuth\(\)/);
  assert.match(route, /clerk\.users\.getUser\(userId\)/);
  assert.match(route, /verifiedEmail === email \? userId : null/);
  assert.doesNotMatch(route, /supabase\.auth\.|auth\.getUser\(token\)/);
  assert.doesNotMatch(
    page + demoProvider + appShell,
    /CLERK_SECRET_KEY|SUPABASE_SECRET_KEY|sk_(?:test|live)_|sb_secret_/,
  );
  assert.match(initialMigration, /clerk_user_id text/i);
  assert.match(initialMigration, /enable row level security/i);
  assert.match(initialMigration, /revoke all.+anon, authenticated/is);
  assert.match(initialMigration, /unique \(email, audience\)/i);
  assert.match(clerkIdentityMigration, /add column if not exists clerk_user_id text/i);
  assert.match(clerkIdentityMigration, /early_access_clerk_user_id_length/i);
  assert.match(clerkIdentityMigration, /early_access_signups_clerk_user_idx/i);
  assert.match(envExample, /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key/);
  assert.match(envExample, /CLERK_SECRET_KEY=sk_test_your_server_only_key/);
  assert.match(envExample, /CLERK_AUTHORIZED_PARTIES=http:\/\/localhost:3000/);
  assert.match(envExample, /ADMIN_CLERK_USER_IDS=user_your_clerk_user_id/);
  assert.match(envExample, /SUPABASE_URL=https:\/\/your-project\.supabase\.co/);
  assert.match(envExample, /SUPABASE_SECRET_KEY=sb_secret_your_server_only_key/);
  assert.doesNotMatch(envExample, /NEXT_PUBLIC_SUPABASE_/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@keyframes card-land/);
  assert.match(css, /@keyframes app-page-in/);
  assert.match(css, /@keyframes confetti-fall/);
  assert.doesNotMatch(css, /(?:linear|radial|conic)-gradient\s*\(/i);
  assert.match(layout, /generateMetadata/);
  assert.match(layout, /\/og\.png/);
  assert.match(packageJson, /"@clerk\/backend"/);
  assert.match(packageJson, /"@clerk\/react"/);
  assert.match(packageJson, /"@supabase\/supabase-js"/);
  assert.match(packageJson, /"next": "16\.2\.6"/);
  assert.match(packageJson, /"build": "next build"/);
  assert.doesNotMatch(packageJson, /vinext|wrangler|@cloudflare\/vite-plugin/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.doesNotMatch(page, /SkeletonPreview|Student or parent|Join early access/);

  await assert.rejects(
    access(new URL("../app/_sites-preview/", import.meta.url)),
  );
  await access(new URL("../public/og.png", import.meta.url));
});

test("admin page is sign-in gated and its API rejects anonymous requests", async () => {
  const pageResponse = await requestApp("/admin", {
    headers: { accept: "text/html" },
  });
  assert.equal(pageResponse.status, 200);
  const html = await pageResponse.text();
  assert.match(html, /Checking your account|Sign in to open the admin panel/);
  assert.match(html, /name="robots"/);
  assert.match(html, /noindex/i);

  const apiResponse = await requestApp("/api/admin/early-access", {
    headers: { accept: "application/json" },
  });
  assert.equal(apiResponse.status, 401);
  assert.equal(apiResponse.headers.get("cache-control"), "no-store");
  assert.match(apiResponse.headers.get("vary") ?? "", /(?:^|,\s*)Authorization(?:,|$)/);
});

test("early-access API rejects unsafe input without contacting Supabase", async () => {
  const unsupported = await requestApp("/api/early-access", {
    method: "POST",
    body: "email=test@example.com",
  });
  assert.equal(unsupported.status, 415);
  assert.equal(unsupported.headers.get("cache-control"), "no-store");

  const invalidAudience = await requestApp("/api/early-access", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "test@example.com", audience: "student" }),
  });
  assert.equal(invalidAudience.status, 400);

  const crossOrigin = await requestApp("/api/early-access", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://untrusted.example",
    },
    body: JSON.stringify({ email: "test@example.com", audience: "family" }),
  });
  assert.equal(crossOrigin.status, 403);

  const nonObject = await requestApp("/api/early-access", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "null",
  });
  assert.equal(nonObject.status, 400);

  const missingSchool = await requestApp("/api/early-access", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "test@example.com", audience: "school" }),
  });
  assert.equal(missingSchool.status, 400);

  const oversizedSchool = await requestApp("/api/early-access", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "test@example.com",
      audience: "school",
      schoolName: "s".repeat(161),
    }),
  });
  assert.equal(oversizedSchool.status, 400);

  const tooLarge = await requestApp("/api/early-access", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ payload: "x".repeat(9_000) }),
  });
  assert.equal(tooLarge.status, 413);
});

test("server-only Clerk and Supabase secrets are absent from the client build", async () => {
  const clientOutput = await collectTextFiles(new URL("../.next/static/", import.meta.url));
  assert.doesNotMatch(clientOutput, /CLERK_SECRET_KEY|SUPABASE_SECRET_KEY/);

  try {
    const localEnvironment = await readFile(new URL("../.env.local", import.meta.url), "utf8");
    for (const variable of ["CLERK_SECRET_KEY", "SUPABASE_SECRET_KEY"]) {
      const secret = localEnvironment
        .match(new RegExp(`^${variable}=(.+)$`, "m"))?.[1]
        ?.trim();
      if (secret) assert.equal(clientOutput.includes(secret), false, `${variable} leaked into the client build`);
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
});
