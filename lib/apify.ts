import { websiteInsightsSchema, type WebsiteInsights } from "@/lib/types";
import { logDebug, logError } from "@/lib/debug";

type ActorDatasetItem = {
  url?: string;
  title?: string;
  description?: string;
  text?: string;
  markdown?: string;
  metadata?: {
    title?: string;
    description?: string;
  };
};

export function inferServicesFromText(text: string) {
  const matches = text.match(
    /\b(web design|web development|seo|branding|content strategy|conversion optimization|automation|product design|marketing strategy|app development)\b/gi,
  );

  return Array.from(new Set((matches ?? []).map((item) => item.toLowerCase())));
}

function extractEmail(text: string) {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
}

function extractPhone(text: string) {
  return (
    text.match(
      /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/,
    )?.[0] ?? ""
  );
}

function extractAddress(text: string) {
  return (
    text.match(
      /\d{1,6}\s+[A-Za-z0-9.'#\-\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Court|Ct),?\s+[A-Za-z.\-\s]+,?\s+[A-Z]{2}\s+\d{5}(?:-\d{4})?/i,
    )?.[0] ?? ""
  );
}

export function normalizeApifyDatasetItem(
  item: ActorDatasetItem,
  sourceUrl: string,
): WebsiteInsights {
  const rawText = [item.description, item.text, item.markdown]
    .filter(Boolean)
    .join("\n")
    .slice(0, 6000);

  return websiteInsightsSchema.parse({
    title: item.title ?? item.metadata?.title ?? "",
    description: item.description ?? item.metadata?.description ?? rawText.slice(0, 240),
    services: inferServicesFromText(rawText),
    businessName: item.title ?? item.metadata?.title ?? "",
    phone: extractPhone(rawText),
    email: extractEmail(rawText),
    address: extractAddress(rawText),
    rawText,
    sourceUrl: item.url ?? sourceUrl,
  });
}

export async function fetchWebsiteInsights(
  url: string,
  fetchImpl: typeof fetch = fetch,
) {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error("Missing APIFY_API_TOKEN.");
  }

  const actorId =
    process.env.APIFY_ACTOR_ID ??
    "apify~website-content-crawler";

  logDebug("apify", "Starting scrape", {
    url,
    actorId,
  });

  const response = await fetchImpl(
    `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${token}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startUrls: [{ url }],
        maxCrawlPages: 3,
        maxCrawlDepth: 1,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    logError("apify", "Apify request failed", {
      status: response.status,
      body: errorText,
    });
    throw new Error(`Apify request failed: ${errorText || response.status}`);
  }

  const payload = (await response.json()) as ActorDatasetItem[];
  const firstItem = payload[0];

  if (!firstItem) {
    logError("apify", "Apify returned no dataset items", { url });
    throw new Error("No website content returned from Apify.");
  }

  const normalized = normalizeApifyDatasetItem(firstItem, url);

  logDebug("apify", "Scrape completed", {
    title: normalized.title,
    services: normalized.services,
    textLength: normalized.rawText.length,
  });

  return normalized;
}
