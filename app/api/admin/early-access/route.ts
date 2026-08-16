import { createClerkClient } from "@clerk/backend";
import { createClient } from "@supabase/supabase-js";

function response(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      Vary: "Authorization",
    },
  });
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return response({ error: "Cross-origin requests are not allowed." }, 403);
  }

  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return response({ error: "Sign in to continue." }, 401);
  }

  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!clerkSecretKey || !clerkPublishableKey) {
    return response(
      { error: "Administrator authentication is not configured.", code: "auth_not_configured" },
      503,
    );
  }

  const clerk = createClerkClient({
    secretKey: clerkSecretKey,
    publishableKey: clerkPublishableKey,
  });
  const authorizedParties = (
    process.env.CLERK_AUTHORIZED_PARTIES ?? "http://localhost:3000"
  )
    .split(",")
    .map((party) => party.trim())
    .filter(Boolean);

  let userId: string | null = null;
  try {
    const requestState = await clerk.authenticateRequest(request, {
      acceptsToken: "session_token",
      authorizedParties,
    });
    userId = requestState.isAuthenticated
      ? requestState.toAuth().userId
      : null;
  } catch {
    return response({ error: "Your session could not be verified." }, 401);
  }

  if (!userId) {
    return response({ error: "Your session has expired. Sign in again." }, 401);
  }

  const administratorIds = (process.env.ADMIN_CLERK_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (administratorIds.length === 0) {
    return response(
      { error: "No administrator account has been assigned yet.", code: "admin_not_configured" },
      503,
    );
  }

  if (!administratorIds.includes(userId)) {
    return response({ error: "This account does not have administrator access." }, 403);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseSecretKey) {
    return response(
      { error: "The administrator data source is not configured.", code: "database_not_configured" },
      503,
    );
  }

  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase
    .from("early_access_signups")
    .select("id,email,audience,school_name,source,clerk_user_id,created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Supabase admin list failed", { code: error.code });
    const setupRequired = error.code === "42P01" || error.code === "PGRST205";
    return response(
      {
        error: setupRequired
          ? "The early-access table has not been created yet."
          : "The submissions could not be loaded.",
        code: setupRequired ? "database_setup_required" : "database_error",
      },
      setupRequired ? 503 : 500,
    );
  }

  const records = (data ?? []).map((record) => ({
    id: record.id,
    email: record.email,
    audience: record.audience,
    schoolName: record.school_name,
    source: record.source,
    hasAccount: Boolean(record.clerk_user_id),
    createdAt: record.created_at,
  }));

  return response({ records, count: records.length });
}
