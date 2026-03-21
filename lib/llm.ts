import { parseProposalResponse } from "@/lib/validation";
import type { Proposal } from "@/lib/types";
import { logDebug, logError } from "@/lib/debug";

function normalizeMessageContent(content: unknown) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (
          item &&
          typeof item === "object" &&
          "type" in item &&
          "text" in item &&
          item.type === "text" &&
          typeof item.text === "string"
        ) {
          return item.text;
        }

        return "";
      })
      .join("\n")
      .trim();
  }

  return "";
}

function resolveProviderConfig() {
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  const apiKey = openRouterKey || openAiKey || "";

  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY or OPENAI_API_KEY.");
  }

  const inferredOpenRouter = apiKey.startsWith("sk-or-");
  const baseUrl = (
    process.env.OPENROUTER_BASE_URL?.trim() ||
    process.env.OPENAI_BASE_URL?.trim() ||
    (inferredOpenRouter ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1")
  ).replace(/\/$/, "");

  const isOpenRouter = baseUrl.includes("openrouter.ai");
  const model = (
    process.env.OPENROUTER_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    (isOpenRouter ? "openai/gpt-4o-mini" : "gpt-5-mini")
  );

  return {
    apiKey,
    baseUrl,
    isOpenRouter,
    model,
  };
}

export async function generateProposal(
  prompt: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Proposal> {
  const { apiKey, baseUrl, model, isOpenRouter } = resolveProviderConfig();

  logDebug("llm", "Preparing completion request", {
    provider: isOpenRouter ? "openrouter" : "openai-compatible",
    baseUrl,
    model,
    apiKeyPrefix: `${apiKey.slice(0, 8)}***`,
    promptLength: prompt.length,
  });

  const response = await fetchImpl(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(isOpenRouter
        ? {
            "HTTP-Referer":
              process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
            "X-Title": process.env.OPENROUTER_APP_NAME ?? "Proposal Agent",
          }
        : {}),
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: "Return only valid JSON for the requested proposal schema.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logError("llm", "Completion request failed", {
      status: response.status,
      body: errorText,
      baseUrl,
      model,
    });

    try {
      const parsed = JSON.parse(errorText) as {
        error?: {
          message?: string;
        };
      };
      throw new Error(parsed.error?.message || `LLM request failed: ${errorText}`);
    } catch {
      throw new Error(errorText || "LLM request failed.");
    }
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: unknown;
      };
    }>;
  };

  const content = normalizeMessageContent(payload.choices?.[0]?.message?.content);
  if (!content) {
    logError("llm", "Completion returned empty content", payload);
    throw new Error("LLM response did not include proposal content.");
  }

  logDebug("llm", "Completion succeeded", {
    contentLength: content.length,
  });

  return parseProposalResponse(content);
}
