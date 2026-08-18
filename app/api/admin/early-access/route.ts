import { authenticateAdministrator } from "@/app/lib/server-admin-auth";
import { sameOriginRequest } from "@/app/lib/server-auth";
import { checkRateLimit, rateLimitHeaders } from "@/app/lib/server-rate-limit";
import { createServerSupabase } from "@/app/lib/server-supabase";

function response(
  body: Record<string, unknown>,
  status = 200,
  headers?: Record<string, string>,
) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      Vary: "Authorization",
      ...headers,
    },
  });
}

export async function GET(request: Request) {
  if (!sameOriginRequest(request)) {
    return response({ error: "Cross-origin requests are not allowed." }, 403);
  }

  const authentication = await authenticateAdministrator(request);
  if (!authentication.ok) {
    return response(
      { error: authentication.error, code: authentication.code },
      authentication.status,
    );
  }

  const rateLimit = await checkRateLimit({
    request,
    scope: "admin-list",
    identity: authentication.user.userId,
    limit: 120,
    windowSeconds: 60,
  });
  if (!rateLimit.allowed) {
    return response(
      { error: "Too many administrator requests. Wait a moment and retry.", code: "rate_limited" },
      429,
      rateLimitHeaders(rateLimit),
    );
  }

  const supabase = createServerSupabase();
  if (!supabase) {
    return response(
      { error: "The administrator data source is not configured.", code: "database_not_configured" },
      503,
    );
  }

  const { data, error } = await supabase
    .from("early_access_signups")
    .select("id,email,audience,school_name,contact_name,student_range,source,clerk_user_id,created_at,updated_at")
    .order("updated_at", { ascending: false })
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
    contactName: record.contact_name,
    studentRange: record.student_range,
    source: record.source,
    hasAccount: Boolean(record.clerk_user_id),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }));

  return response({ records, count: records.length });
}
