import { authenticateMvpRequest, sameOriginRequest } from "@/app/lib/server-auth";
import { checkRateLimit, rateLimitHeaders } from "@/app/lib/server-rate-limit";
import { createServerSupabase } from "@/app/lib/server-supabase";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_RANGES = new Set(["Under 150", "150-300", "300-600", "600+"]);
const MAX_BODY_BYTES = 8_192;

function response(
  body: Record<string, unknown>,
  status = 200,
  headers?: Record<string, string>,
) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

function cleanText(value: unknown) {
  if (typeof value !== "string") return "";
  return value.normalize("NFKC").trim().replace(/\s+/g, " ");
}

export async function POST(request: Request) {
  if (!sameOriginRequest(request)) {
    return response({ error: "Cross-origin requests are not allowed." }, 403);
  }
  if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    return response({ error: "Send this request as JSON." }, 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return response({ error: "This request is too large." }, 413);
  }

  let body: Record<string, unknown>;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return response({ error: "This request is too large." }, 413);
    }
    const parsed = JSON.parse(rawBody) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return response({ error: "The request body must be a JSON object." }, 400);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return response({ error: "The request body is not valid JSON." }, 400);
  }

  if (cleanText(body.website)) {
    return response({ ok: true });
  }

  const email = cleanText(body.email).toLowerCase();
  const audience = body.audience;
  const schoolName = cleanText(body.schoolName);
  const contactName = cleanText(body.contactName);
  const studentRange = cleanText(body.studentRange);

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return response({ error: "Enter a valid email address." }, 400);
  }
  if (audience !== "family" && audience !== "school") {
    return response({ error: "Choose parent or guardian, or school." }, 400);
  }
  if (audience === "school" && (schoolName.length < 2 || schoolName.length > 160)) {
    return response({ error: "Enter your school name." }, 400);
  }
  if (audience === "school" && (contactName.length < 2 || contactName.length > 100)) {
    return response({ error: "Enter your name." }, 400);
  }
  if (audience === "school" && !STUDENT_RANGES.has(studentRange)) {
    return response({ error: "Choose an approximate student range." }, 400);
  }

  const rateLimit = await checkRateLimit({
    request,
    scope: "early-access",
    limit: 12,
    windowSeconds: 3_600,
  });
  if (!rateLimit.allowed) {
    return response(
      { error: "Too many requests were sent from this connection. Try again later.", code: "rate_limited" },
      429,
      rateLimitHeaders(rateLimit),
    );
  }

  let clerkUserId: string | undefined;
  if (request.headers.has("authorization")) {
    const authentication = await authenticateMvpRequest(request);
    if (!authentication.ok) {
      return response(
        { error: authentication.error, code: authentication.code },
        authentication.status,
      );
    }
    if (authentication.user.email === email) clerkUserId = authentication.user.userId;
  }

  const supabase = createServerSupabase();
  if (!supabase) {
    return response({ error: "Early access is not configured yet." }, 503);
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("early_access_signups").upsert({
    audience,
    email,
    school_name: audience === "school" ? schoolName : null,
    contact_name: audience === "school" ? contactName : null,
    student_range: audience === "school" ? studentRange : null,
    source: "planify-site",
    updated_at: now,
    ...(clerkUserId ? { clerk_user_id: clerkUserId } : {}),
  }, {
    onConflict: "email,audience",
    ignoreDuplicates: false,
    defaultToNull: false,
  });

  if (error) {
    console.error("Supabase early-access upsert failed", { code: error.code });
    const setupRequired = error.code === "42P01" || error.code === "PGRST205" || error.code === "PGRST204";
    return response(
      {
        error: setupRequired
          ? "Early access is being configured. Please try again shortly."
          : "We could not save your request. Please try again.",
      },
      setupRequired ? 503 : 500,
    );
  }

  return response({ ok: true }, 200);
}
