import { buildProposalPrompt } from "@/lib/prompt";
import { fetchWebsiteInsights } from "@/lib/apify";
import { buildInsightsFromLead } from "@/lib/discover";
import { generateProposal } from "@/lib/llm";
import {
  generateProposalFromLeadRequestSchema,
  generateProposalRequestSchema,
} from "@/lib/types";
import { logDebug, logError } from "@/lib/debug";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const urlResult = generateProposalRequestSchema.safeParse(rawBody);
    const leadResult = generateProposalFromLeadRequestSchema.safeParse(rawBody);

    if (!urlResult.success && !leadResult.success) {
      throw new Error("Provide a client website URL or a discovered business lead.");
    }

    const url = urlResult.success ? urlResult.data.url : null;
    const lead = leadResult.success ? leadResult.data.lead : null;
    const effectiveUrl = url;

    logDebug("api/generate", "Request received", {
      hasUrl: Boolean(effectiveUrl || lead?.website),
      hasLead: Boolean(lead),
      url: effectiveUrl ?? lead?.website ?? null,
    });

    let insights = lead ? buildInsightsFromLead(lead) : null;

    if (effectiveUrl) {
      try {
        const websiteInsights = await fetchWebsiteInsights(effectiveUrl);
        insights = websiteInsights;
      } catch {
        logError("api/generate", "Continuing without website insights", {
          url: effectiveUrl,
        });
        insights = null;
      }
    }

    const prompt = buildProposalPrompt({
      url: effectiveUrl ?? undefined,
      lead: lead ?? undefined,
      insights: insights ?? undefined,
    });

    const proposal = await generateProposal(prompt);

    logDebug("api/generate", "Proposal generated", {
      hasInsights: Boolean(insights),
      problemCount: proposal.problems.length,
      deliverableCount: proposal.deliverables.length,
    });

    return Response.json({
      proposal,
      insights,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Proposal generation failed.";

    logError("api/generate", "Request failed", {
      message,
    });

    return Response.json({ error: message }, { status: 500 });
  }
}
