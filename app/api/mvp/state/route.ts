import {
  parseWorkspaceState,
  type StudentWorkspaceState,
} from "@/app/lib/mvp-state";
import { authenticateMvpRequest, sameOriginRequest } from "@/app/lib/server-auth";
import { checkRateLimit, rateLimitHeaders } from "@/app/lib/server-rate-limit";
import { createServerSupabase } from "@/app/lib/server-supabase";

const MAX_BODY_BYTES = 64 * 1024;

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

function databaseError(code?: string) {
  const setupRequired = code === "42P01" || code === "PGRST205";
  return response(
    {
      error: setupRequired
        ? "The student workspace table has not been created yet."
        : "Your workspace could not be loaded.",
      code: setupRequired ? "database_setup_required" : "database_error",
    },
    setupRequired ? 503 : 500,
  );
}

function stateFromRow(row: Record<string, unknown>) {
  return parseWorkspaceState({
    studentName: row.student_name,
    selectedCareerId: row.selected_career_id,
    answers: row.answers,
    completedTaskIds: row.completed_task_ids,
    portfolioItems: row.portfolio_items,
    connectedMentorIds: row.connected_mentor_ids,
  });
}

export async function GET(request: Request) {
  if (!sameOriginRequest(request)) {
    return response({ error: "Cross-origin requests are not allowed." }, 403);
  }

  const authentication = await authenticateMvpRequest(request);
  if (!authentication.ok) {
    return response({ error: authentication.error, code: authentication.code }, authentication.status);
  }

  const rateLimit = await checkRateLimit({
    request,
    scope: "workspace-read",
    identity: authentication.user.userId,
    limit: 120,
    windowSeconds: 60,
  });
  if (!rateLimit.allowed) {
    return response(
      { error: "Too many workspace requests. Wait a moment and retry.", code: "rate_limited" },
      429,
      rateLimitHeaders(rateLimit),
    );
  }

  const supabase = createServerSupabase();
  if (!supabase) {
    return response({ error: "Workspace persistence is not configured.", code: "database_not_configured" }, 503);
  }

  const { data, error } = await supabase
    .from("student_workspaces")
    .select("student_name,selected_career_id,answers,completed_task_ids,portfolio_items,connected_mentor_ids,updated_at")
    .eq("clerk_user_id", authentication.user.userId)
    .maybeSingle();

  if (error) {
    console.error("Supabase workspace read failed", { code: error.code });
    return databaseError(error.code);
  }
  if (!data) {
    return response({ error: "No saved workspace yet.", code: "workspace_not_found" }, 404);
  }

  const state = stateFromRow(data as Record<string, unknown>);
  if (!state) {
    return response({ error: "The saved workspace is invalid.", code: "invalid_saved_state" }, 500);
  }

  return response({ state, updatedAt: data.updated_at });
}

export async function PUT(request: Request) {
  if (!sameOriginRequest(request)) {
    return response({ error: "Cross-origin requests are not allowed." }, 403);
  }
  if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    return response({ error: "Send this request as JSON." }, 415);
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return response({ error: "This workspace update is too large." }, 413);
  }

  const authentication = await authenticateMvpRequest(request);
  if (!authentication.ok) {
    return response({ error: authentication.error, code: authentication.code }, authentication.status);
  }

  const rateLimit = await checkRateLimit({
    request,
    scope: "workspace-write",
    identity: authentication.user.userId,
    limit: 180,
    windowSeconds: 600,
  });
  if (!rateLimit.allowed) {
    return response(
      { error: "Your progress is being saved too quickly. Wait a moment and retry.", code: "rate_limited" },
      429,
      rateLimitHeaders(rateLimit),
    );
  }

  let parsedBody: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return response({ error: "This workspace update is too large." }, 413);
    }
    parsedBody = JSON.parse(raw);
  } catch {
    return response({ error: "The request body is not valid JSON." }, 400);
  }

  if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) {
    return response({ error: "The request body must be a JSON object." }, 400);
  }
  const state = parseWorkspaceState((parsedBody as { state?: unknown }).state);
  if (!state) {
    return response({ error: "The student workspace contains invalid values." }, 400);
  }

  const supabase = createServerSupabase();
  if (!supabase) {
    return response({ error: "Workspace persistence is not configured.", code: "database_not_configured" }, 503);
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("student_workspaces")
    .upsert({
      clerk_user_id: authentication.user.userId,
      contact_email: authentication.user.email,
      student_name: state.studentName,
      class_level: Number(state.answers.classLevel),
      selected_career_id: state.selectedCareerId,
      answers: state.answers,
      completed_task_ids: state.completedTaskIds,
      portfolio_items: state.portfolioItems,
      connected_mentor_ids: state.connectedMentorIds,
      updated_at: now,
    }, { onConflict: "clerk_user_id" })
    .select("updated_at")
    .single();

  if (error) {
    console.error("Supabase workspace save failed", { code: error.code });
    return databaseError(error.code);
  }

  return response({ ok: true, updatedAt: data?.updated_at ?? now });
}

export type { StudentWorkspaceState };
