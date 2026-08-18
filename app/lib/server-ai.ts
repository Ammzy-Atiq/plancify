export type AiProvider = "openai" | "gemini" | "anthropic";

export type AiGuideRequest = {
  instructions: string;
  input: string;
  safetyIdentifier: string;
};

export type AiGuideResult = {
  reply: string;
  provider: AiProvider;
  model: string;
};

type ProviderConfig = {
  provider: AiProvider;
  apiKey: string;
  model: string;
};

const DEFAULT_PROVIDER_ORDER: AiProvider[] = ["openai", "gemini", "anthropic"];

function providerName(value: string): AiProvider | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === "openai") return "openai";
  if (normalized === "gemini" || normalized === "google") return "gemini";
  if (normalized === "anthropic" || normalized === "claude") return "anthropic";
  return null;
}

function providerOrder() {
  const configured = process.env.AI_PROVIDER_ORDER ?? process.env.AI_PROVIDER ?? "";
  const requested = configured
    .split(",")
    .map(providerName)
    .filter((provider): provider is AiProvider => provider !== null);
  return [...new Set([...requested, ...DEFAULT_PROVIDER_ORDER])];
}

function configFor(provider: AiProvider): ProviderConfig | null {
  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) return null;
    return {
      provider,
      apiKey,
      model: process.env.OPENAI_MODEL?.trim() || "gpt-5.6-luna",
    };
  }
  if (provider === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) return null;
    return {
      provider,
      apiKey,
      model: process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash",
    };
  }
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return null;
  return {
    provider,
    apiKey,
    model: process.env.ANTHROPIC_MODEL?.trim() || "claude-haiku-4-5-20251001",
  };
}

function requestTimeout() {
  const configured = Number(process.env.AI_PROVIDER_TIMEOUT_MS ?? "10000");
  return Number.isFinite(configured)
    ? Math.min(Math.max(Math.round(configured), 3_000), 15_000)
    : 10_000;
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeout());
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function extractOpenAiText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as {
    output_text?: unknown;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };
  if (typeof record.output_text === "string") return record.output_text.trim();
  return (record.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text" && typeof item.text === "string")
    .map((item) => item.text?.trim())
    .filter(Boolean)
    .join("\n");
}

function extractGeminiText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }>;
  };
  return (record.candidates ?? [])
    .flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => typeof part.text === "string" ? part.text.trim() : "")
    .filter(Boolean)
    .join("\n");
}

function extractAnthropicText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as {
    content?: Array<{ type?: unknown; text?: unknown }>;
  };
  return (record.content ?? [])
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => String(block.text).trim())
    .filter(Boolean)
    .join("\n");
}

async function callOpenAi(config: ProviderConfig, request: AiGuideRequest) {
  const response = await fetchWithTimeout("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      store: false,
      max_output_tokens: 220,
      safety_identifier: request.safetyIdentifier,
      instructions: request.instructions,
      input: request.input,
    }),
  });
  if (!response.ok) throw new Error(`openai_${response.status}`);
  const reply = extractOpenAiText(await response.json());
  if (!reply) throw new Error("openai_empty");
  return reply;
}

async function callGemini(config: ProviderConfig, request: AiGuideRequest) {
  const model = config.model.replace(/^models\//, "");
  if (!/^[a-zA-Z0-9._:-]{1,160}$/.test(model)) {
    throw new Error("gemini_invalid_model");
  }
  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: request.instructions }] },
        contents: [{ role: "user", parts: [{ text: request.input }] }],
        generationConfig: { maxOutputTokens: 220 },
        store: false,
      }),
    },
  );
  if (!response.ok) throw new Error(`gemini_${response.status}`);
  const reply = extractGeminiText(await response.json());
  if (!reply) throw new Error("gemini_empty");
  return reply;
}

async function callAnthropic(config: ProviderConfig, request: AiGuideRequest) {
  const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 220,
      system: request.instructions,
      messages: [{ role: "user", content: request.input }],
    }),
  });
  if (!response.ok) throw new Error(`anthropic_${response.status}`);
  const reply = extractAnthropicText(await response.json());
  if (!reply) throw new Error("anthropic_empty");
  return reply;
}

async function callProvider(config: ProviderConfig, request: AiGuideRequest) {
  if (config.provider === "openai") return callOpenAi(config, request);
  if (config.provider === "gemini") return callGemini(config, request);
  return callAnthropic(config, request);
}

export function configuredAiProviders() {
  return providerOrder().filter((provider) => configFor(provider) !== null);
}

export async function generateAiGuideReply(
  request: AiGuideRequest,
): Promise<AiGuideResult | null> {
  for (const provider of providerOrder()) {
    const config = configFor(provider);
    if (!config) continue;
    try {
      const reply = await callProvider(config, request);
      return { reply, provider, model: config.model };
    } catch (error) {
      console.error("AI provider request failed", {
        provider,
        code: error instanceof Error ? error.message.slice(0, 48) : "unknown",
      });
    }
  }
  return null;
}
