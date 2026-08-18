import { createClerkClient } from "@clerk/backend";

export type AuthenticatedMvpUser = {
  userId: string;
  email: string | null;
};

export type MvpAuthResult =
  | { ok: true; user: AuthenticatedMvpUser }
  | { ok: false; status: number; error: string; code: string };

export function configuredAuthorizedParties() {
  return (process.env.CLERK_AUTHORIZED_PARTIES ?? "http://localhost:3000")
    .split(",")
    .map((party) => party.trim())
    .filter(Boolean);
}

export async function authenticateMvpRequest(request: Request): Promise<MvpAuthResult> {
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return { ok: false, status: 401, error: "Sign in to continue.", code: "signed_out" };
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!secretKey || !publishableKey) {
    return {
      ok: false,
      status: 503,
      error: "Account persistence is not configured yet.",
      code: "auth_not_configured",
    };
  }

  try {
    const clerk = createClerkClient({ secretKey, publishableKey });
    const requestState = await clerk.authenticateRequest(request, {
      acceptsToken: "session_token",
      authorizedParties: configuredAuthorizedParties(),
    });
    if (!requestState.isAuthenticated) {
      return { ok: false, status: 401, error: "Your session has expired.", code: "invalid_session" };
    }

    const { userId } = requestState.toAuth();
    if (!userId) {
      return { ok: false, status: 401, error: "Your session has expired.", code: "invalid_session" };
    }

    let email: string | null = null;
    try {
      const user = await clerk.users.getUser(userId);
      email = user.emailAddresses
        .find((address) => address.id === user.primaryEmailAddressId)
        ?.emailAddress.trim().toLowerCase() ?? null;
    } catch {
      // Persistence can continue with a verified Clerk ID if profile lookup is unavailable.
    }

    return { ok: true, user: { userId, email } };
  } catch {
    return { ok: false, status: 401, error: "Your session could not be verified.", code: "invalid_session" };
  }
}

export function sameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
