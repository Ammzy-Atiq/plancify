import { createServerSupabase } from "@/app/lib/server-supabase";

type RateLimitOptions = {
  request: Request;
  scope: string;
  limit: number;
  windowSeconds: number;
  identity?: string | null;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type MemoryBucket = {
  count: number;
  startedAt: number;
};

const memoryBuckets = new Map<string, MemoryBucket>();
let lastMemorySweep = 0;

function requestAddress(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  ).slice(0, 128);
}

async function privateBucket(scope: string, identity: string) {
  const salt =
    process.env.RATE_LIMIT_SALT ??
    process.env.CLERK_SECRET_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    "plancify-local-rate-limit";
  const bytes = new TextEncoder().encode(`${salt}\u0000${scope}\u0000${identity}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `${scope}:${hash}`;
}

export async function privacySafeIdentifier(scope: string, identity: string) {
  const bucket = await privateBucket(scope, identity);
  return bucket.slice(bucket.indexOf(":") + 1);
}

function checkMemoryLimit(
  bucket: string,
  limit: number,
  windowSeconds: number,
): RateLimitResult {
  const now = Date.now();
  const windowMilliseconds = windowSeconds * 1_000;
  const current = memoryBuckets.get(bucket);
  const record = !current || now - current.startedAt >= windowMilliseconds
    ? { count: 1, startedAt: now }
    : { count: current.count + 1, startedAt: current.startedAt };
  memoryBuckets.set(bucket, record);

  if (now - lastMemorySweep > 60_000 || memoryBuckets.size > 10_000) {
    lastMemorySweep = now;
    for (const [key, value] of memoryBuckets) {
      if (now - value.startedAt > Math.max(windowMilliseconds, 3_600_000)) {
        memoryBuckets.delete(key);
      }
    }
  }

  return {
    allowed: record.count <= limit,
    remaining: Math.max(limit - record.count, 0),
    retryAfterSeconds: record.count <= limit
      ? 0
      : Math.max(1, Math.ceil((record.startedAt + windowMilliseconds - now) / 1_000)),
  };
}

export async function checkRateLimit({
  request,
  scope,
  limit,
  windowSeconds,
  identity,
}: RateLimitOptions): Promise<RateLimitResult> {
  const bucket = await privateBucket(scope, identity ?? requestAddress(request));
  const memoryResult = checkMemoryLimit(bucket, limit, windowSeconds);
  if (!memoryResult.allowed) return memoryResult;

  const supabase = createServerSupabase();
  if (!supabase) return memoryResult;

  const { data, error } = await supabase.rpc("consume_api_rate_limit", {
    p_bucket: bucket,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  }).single();

  if (error) {
    // The in-memory guard still protects this running instance while the
    // database function is being installed or Supabase is briefly unavailable.
    console.error("Supabase rate limit check failed", { code: error.code });
    return memoryResult;
  }

  const row = data as {
    allowed?: unknown;
    remaining?: unknown;
    retry_after_seconds?: unknown;
  } | null;
  return {
    allowed: row?.allowed === true,
    remaining: typeof row?.remaining === "number" ? row.remaining : 0,
    retryAfterSeconds:
      typeof row?.retry_after_seconds === "number" ? row.retry_after_seconds : windowSeconds,
  };
}

export function rateLimitHeaders(result: RateLimitResult) {
  return {
    "Retry-After": String(Math.max(1, result.retryAfterSeconds)),
    "X-RateLimit-Remaining": String(result.remaining),
  };
}
