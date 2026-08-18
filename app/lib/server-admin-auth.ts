import { authenticateMvpRequest } from "@/app/lib/server-auth";

export async function authenticateAdministrator(request: Request) {
  const authentication = await authenticateMvpRequest(request);
  if (!authentication.ok) return authentication;

  const administratorIds = (process.env.ADMIN_CLERK_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const administratorEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (administratorIds.length === 0 && administratorEmails.length === 0) {
    return {
      ok: false as const,
      status: 503,
      error: "No administrator account has been assigned yet.",
      code: "admin_not_configured",
    };
  }
  const allowedById = administratorIds.includes(authentication.user.userId);
  const allowedByEmail = Boolean(
    authentication.user.email && administratorEmails.includes(authentication.user.email),
  );
  if (!allowedById && !allowedByEmail) {
    return {
      ok: false as const,
      status: 403,
      error: "This account does not have administrator access.",
      code: "forbidden",
    };
  }
  return authentication;
}
