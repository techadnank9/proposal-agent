import {
  businessLeadSchema,
  type BusinessLead,
  type WebsiteInsights,
  websiteInsightsSchema,
} from "@/lib/types";
import { logDebug, logError } from "@/lib/debug";

type GoogleMapsActorItem = Record<string, unknown>;

function normalizeString(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  return "";
}

function normalizeNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function pickString(item: GoogleMapsActorItem, keys: string[]) {
  for (const key of keys) {
    const value = normalizeString(item[key]);
    if (value) {
      return value;
    }
  }

  return "";
}

function pickEmail(item: GoogleMapsActorItem) {
  const emails = item.Emails;

  if (Array.isArray(emails)) {
    return emails.map((entry) => normalizeString(entry)).find(Boolean) ?? "";
  }

  return pickString(item, ["Email", "email"]);
}

export function normalizeGoogleMapsLead(
  item: GoogleMapsActorItem,
  category: string,
  locationText: string,
): BusinessLead {
  return businessLeadSchema.parse({
    name: pickString(item, ["Business Name", "name", "title"]),
    category,
    address: pickString(item, ["Business Address", "Address", "address"]),
    phone: pickString(item, ["Phone", "phone", "businessPhone"]),
    email: pickEmail(item),
    website: pickString(item, ["Website", "website", "businessWebsite"]),
    rating: normalizeNumber(item.Rating ?? item.rating),
    reviewsCount: Math.round(normalizeNumber(item.Reviews ?? item.reviewCount) ?? 0),
    sourceUrl: pickString(item, ["Google Maps URL", "googleMapsUrl", "url"]),
    locationText,
  });
}

export async function fetchGoogleMapsLeads(
  category: string,
  locationText: string,
  fetchImpl: typeof fetch = fetch,
) {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error("Missing APIFY_API_TOKEN.");
  }

  const actorId =
    process.env.APIFY_GOOGLE_MAPS_ACTOR_ID ??
    "lead.gen.labs~google-maps-business-lead-and-business-website-scraper";

  const query = `${category} in ${locationText}`;

  logDebug("discover", "Starting Google Maps lead search", {
    actorId,
    query,
  });

  const response = await fetchImpl(
    `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${token}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        business_category_and_location: query,
        max_pages: 2,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    logError("discover", "Google Maps actor request failed", {
      status: response.status,
      body: errorText,
    });
    throw new Error(errorText || "Failed to discover businesses.");
  }

  const payload = (await response.json()) as GoogleMapsActorItem[];
  const leads = payload
    .map((item) => normalizeGoogleMapsLead(item, category, locationText))
    .filter((lead) => lead.name);

  logDebug("discover", "Google Maps lead search completed", {
    leadCount: leads.length,
  });

  return leads;
}

export function buildInsightsFromLead(lead: BusinessLead): WebsiteInsights {
  return websiteInsightsSchema.parse({
    title: lead.name,
    description: lead.category,
    services: lead.category ? [lead.category] : [],
    businessName: lead.name,
    phone: lead.phone,
    email: lead.email,
    address: lead.address,
    rawText: [
      lead.name,
      lead.category,
      lead.address,
      lead.phone,
      lead.email,
      lead.website,
    ]
      .filter(Boolean)
      .join("\n"),
    sourceUrl: lead.website || lead.sourceUrl,
  });
}

export function mergeLeadWithWebsiteInsights(
  lead: BusinessLead,
  websiteInsights: WebsiteInsights | null,
): WebsiteInsights {
  if (!websiteInsights) {
    return buildInsightsFromLead(lead);
  }

  return websiteInsightsSchema.parse({
    ...websiteInsights,
    title: websiteInsights.title || lead.name,
    description: websiteInsights.description || lead.category,
    services:
      websiteInsights.services.length > 0
        ? Array.from(new Set([lead.category, ...websiteInsights.services].filter(Boolean)))
        : lead.category
          ? [lead.category]
          : [],
    businessName: lead.name || websiteInsights.businessName,
    phone: lead.phone || websiteInsights.phone,
    email: lead.email || websiteInsights.email,
    address: lead.address || websiteInsights.address,
    sourceUrl: lead.website || lead.sourceUrl || websiteInsights.sourceUrl,
    rawText: [websiteInsights.rawText, lead.address, lead.phone, lead.email]
      .filter(Boolean)
      .join("\n"),
  });
}
