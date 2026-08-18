import { careers, skills } from "@/app/lib/demo-data";
import { authenticateMvpRequest, sameOriginRequest } from "@/app/lib/server-auth";
import {
  configuredAiProviders,
  generateAiGuideReply,
} from "@/app/lib/server-ai";
import {
  checkRateLimit,
  privacySafeIdentifier,
  rateLimitHeaders,
} from "@/app/lib/server-rate-limit";
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

function cleanPrompt(value: unknown) {
  if (typeof value !== "string") return "";
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").slice(0, 400);
}

function localGuideReply(prompt: string, goal: string, completedTasks: number) {
  const normalized = prompt.toLowerCase();
  if (normalized.includes("next")) {
    return `Choose one small ${goal} experiment you can finish this week. Spend 30 minutes planning it, build the simplest version, then write down one thing you enjoyed and one thing you would change.`;
  }
  if (normalized.includes("doing") || normalized.includes("progress")) {
    return `You have completed ${completedTasks} weekly action${completedTasks === 1 ? "" : "s"}. Progress matters more than certainty: finish one practical task, record what felt energising, and use that evidence to adjust your ${goal} plan.`;
  }
  if (normalized.includes("project") || normalized.includes("try")) {
    return `Try a seven-day mini project connected to ${goal}: identify a real problem, make a basic solution, show it to one trusted adult or friend, and record their feedback. Keep the first version deliberately small.`;
  }
  return `For your ${goal} direction, turn this question into a safe, small experiment. Research for 20 minutes, try one practical activity, and record what interested or surprised you before deciding the next step.`;
}

export async function POST(request: Request) {
  if (!sameOriginRequest(request)) {
    return response({ error: "Cross-origin requests are not allowed." }, 403);
  }
  if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    return response({ error: "Send this request as JSON." }, 415);
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 8_192) {
    return response({ error: "This message is too large." }, 413);
  }
  const authentication = await authenticateMvpRequest(request);
  if (!authentication.ok) {
    return response({ error: authentication.error, code: authentication.code }, authentication.status);
  }

  const rateLimit = await checkRateLimit({
    request,
    scope: "ai-guide",
    identity: authentication.user.userId,
    limit: 30,
    windowSeconds: 600,
  });
  if (!rateLimit.allowed) {
    return response(
      { error: "You have asked several questions quickly. Wait a little before trying again.", code: "rate_limited" },
      429,
      rateLimitHeaders(rateLimit),
    );
  }

  let body: { prompt?: unknown };
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 8_192) {
      return response({ error: "This message is too large." }, 413);
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    body = parsed as { prompt?: unknown };
  } catch {
    return response({ error: "The message is not valid JSON." }, 400);
  }

  const prompt = cleanPrompt(body.prompt);
  if (prompt.length < 2) return response({ error: "Ask a short question first." }, 400);

  const supabase = createServerSupabase();
  let goal = "Software Engineer";
  let completedTasks = 0;
  if (supabase) {
    const { data } = await supabase
      .from("student_workspaces")
      .select("selected_career_id,completed_task_ids")
      .eq("clerk_user_id", authentication.user.userId)
      .maybeSingle();
    goal = careers.find((career) => career.id === data?.selected_career_id)?.title ?? goal;
    completedTasks = Array.isArray(data?.completed_task_ids) ? data.completed_task_ids.length : 0;
  }

  const fallbackReply = localGuideReply(prompt, goal, completedTasks);
  const configuredProviders = configuredAiProviders();
  const generated = await generateAiGuideReply({
    safetyIdentifier: await privacySafeIdentifier("ai-guide", authentication.user.userId),
    instructions:
      "You are Plancify Guide, a concise and encouraging career-exploration coach for Indian school students in Classes 6-12. Never declare one career as the student's destiny. Suggest safe, age-appropriate experiments and next steps. Do not provide medical, legal, financial, or mental-health diagnoses. Do not advertise courses. Use plain language and stay under 120 words.",
    input: `Student goal: ${goal}\nWeekly actions completed: ${completedTasks} of 3\nTracked skills: ${skills.map((skill) => `${skill.name} level ${skill.level}/5`).join(", ")}\nQuestion: ${prompt}`,
  });

  if (generated) {
    return response({
      reply: generated.reply,
      source: generated.provider,
      model: generated.model,
    });
  }

  return response({
    reply: fallbackReply,
    source: "local",
    degraded: configuredProviders.length > 0,
  });
}
