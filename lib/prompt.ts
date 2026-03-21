import type { BusinessLead, Proposal, WebsiteInsights } from "@/lib/types";

type PromptInput = {
  url?: string;
  lead?: BusinessLead | null;
  insights?: WebsiteInsights | null;
};

export function buildProposalPrompt({
  url,
  lead,
  insights,
}: PromptInput) {
  const services = insights?.services?.length
    ? insights.services.join(", ")
    : "No clear services extracted";

  return `
You are an expert freelance consultant writing a concise but persuasive proposal.

Your task:
- personalize the proposal to the client business
- use concrete website insights when available
- sound human, credible, and commercially sharp
- avoid fluff
- return valid JSON only

Client website: ${url || "Not provided"}
Client title: ${insights?.title || lead?.name || "Unknown"}
Client description: ${insights?.description || "Unknown"}
Client services: ${services}
Business name: ${insights?.businessName || lead?.name || "Unknown"}
Business category: ${lead?.category || "Unknown"}
Business address: ${insights?.address || lead?.address || "Unknown"}
Business phone: ${insights?.phone || lead?.phone || "Unknown"}
Business email: ${insights?.email || lead?.email || "Unknown"}
Business location context: ${lead?.locationText || "Unknown"}
Google Maps reviews: ${lead?.reviewsCount || 0}
Google Maps rating: ${lead?.rating ?? "Unknown"}

Return exactly this JSON shape:
{
  "intro": "",
  "client_understanding": "",
  "problems": [],
  "solution": "",
  "deliverables": [],
  "timeline": "",
  "pricing": ""
}

Requirements:
- reference the client's business specifically
- mention real insights when provided
- make problems and deliverables concrete
- keep each field concise and useful
`.trim();
}

export function createEmptyProposal(): Proposal {
  return {
    intro: "",
    client_understanding: "",
    problems: [],
    solution: "",
    deliverables: [],
    timeline: "",
    pricing: "",
  };
}
