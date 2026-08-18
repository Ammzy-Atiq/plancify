import { workspaceCompletion } from "@/app/lib/mvp-state";
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
    headers: { "Cache-Control": "no-store", Vary: "Authorization", ...headers },
  });
}

export async function GET(request: Request) {
  if (!sameOriginRequest(request)) {
    return response({ error: "Cross-origin requests are not allowed." }, 403);
  }
  const authentication = await authenticateAdministrator(request);
  if (!authentication.ok) {
    return response({ error: authentication.error, code: authentication.code }, authentication.status);
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
    return response({ error: "The student data source is not configured.", code: "database_not_configured" }, 503);
  }

  const { data, error } = await supabase
    .from("student_workspaces")
    .select("clerk_user_id,contact_email,student_name,class_level,selected_career_id,answers,completed_task_ids,portfolio_items,connected_mentor_ids,created_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Supabase admin workspace list failed", { code: error.code });
    const setupRequired = error.code === "42P01" || error.code === "PGRST205";
    return response({
      error: setupRequired
        ? "The student workspace migration has not been run yet."
        : "Student workspaces could not be loaded.",
      code: setupRequired ? "database_setup_required" : "database_error",
    }, setupRequired ? 503 : 500);
  }

  const records = (data ?? []).map((row) => {
    const state = {
      studentName: row.student_name,
      selectedCareerId: row.selected_career_id,
      answers: row.answers,
      completedTaskIds: row.completed_task_ids,
      portfolioItems: row.portfolio_items,
      connectedMentorIds: row.connected_mentor_ids,
    };
    return {
      clerkUserId: row.clerk_user_id,
      email: row.contact_email,
      studentName: row.student_name,
      classLevel: row.class_level,
      selectedCareerId: row.selected_career_id,
      completion: workspaceCompletion(state),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });

  return response({ records, count: records.length });
}
