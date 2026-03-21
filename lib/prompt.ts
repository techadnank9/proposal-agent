import type { Proposal, WebsiteInsights } from "@/lib/types";

type PromptInput = {
  url: string;
  insights?: WebsiteInsights | null;
};

export function buildProposalPrompt({
  url,
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
Client title: ${insights?.title || "Unknown"}
Client description: ${insights?.description || "Unknown"}
Client services: ${services}

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
