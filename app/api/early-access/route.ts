import { createClerkClient } from "@clerk/backend";
import { createClient } from "@supabase/supabase-js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function response(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function cleanText(value: unknown) {
  if (typeof value !== "string") return "";
  return value.normalize("NFKC").trim().replace(/\s+/g, " ");
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return response({ error: "Cross-origin requests are not allowed." }, 403);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return response({ error: "Send this request as JSON." }, 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 8_192) {
    return response({ error: "This request is too large." }, 413);
  }

  let body: Record<string, unknown>;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 8_192) {
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

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return response({ error: "Enter a valid email address." }, 400);
  }

  if (audience !== "family" && audience !== "school") {
    return response({ error: "Choose parent or guardian, or school." }, 400);
  }

  if (audience === "school" && (schoolName.length < 2 || schoolName.length > 160)) {
    return response({ error: "Enter your school name." }, 400);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) {
    return response({ error: "Early access is not configured yet." }, 503);
  }

  const supabase = createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  let clerkUserId: string | null = null;
  const authorization = request.headers.get("authorization");
  if (authorization) {
    const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return response({ error: "The account session is not valid." }, 401);

    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (!clerkSecretKey || !clerkPublishableKey) {
      return response({ error: "Account verification is not configured yet." }, 503);
    }

    const authorizedParties = (
      process.env.CLERK_AUTHORIZED_PARTIES ?? "http://localhost:3000"
    )
      .split(",")
      .map((party) => party.trim())
      .filter(Boolean);
    const clerk = createClerkClient({
      secretKey: clerkSecretKey,
      publishableKey: clerkPublishableKey,
    });
    const requestState = await clerk.authenticateRequest(request, {
      acceptsToken: "session_token",
      authorizedParties,
    });

    if (!requestState.isAuthenticated) {
      return response({ error: "Your account session has expired. Sign in again and retry." }, 401);
    }

    const { userId } = requestState.toAuth();
    if (!userId) {
      return response({ error: "Your account session has expired. Sign in again and retry." }, 401);
    }

    try {
      const clerkUser = await clerk.users.getUser(userId);
      const verifiedEmail = clerkUser.emailAddresses
        .find((address) => address.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress.trim()
        .toLowerCase();
      clerkUserId = verifiedEmail === email ? userId : null;
    } catch {
      // A valid public request can still be saved when Clerk's profile API is unavailable.
      clerkUserId = null;
    }
  }

  const { error } = await supabase.from("early_access_signups").insert({
    audience,
    email,
    school_name: audience === "school" ? schoolName : null,
    source: "planify-local-site",
    clerk_user_id: clerkUserId,
  });

  if (error?.code === "23505") {
    return response({ ok: true });
  }

  if (error) {
    console.error("Supabase early-access insert failed", { code: error.code });
    const setupRequired = error.code === "42P01" || error.code === "PGRST205";
    return response(
      {
        error: setupRequired
          ? "Early access is being configured. Please try again shortly."
          : "We could not save your request. Please try again.",
      },
      setupRequired ? 503 : 500,
    );
  }

  return response({ ok: true }, 201);
}
