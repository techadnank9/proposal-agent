import { buildProposalPrompt } from "@/lib/prompt";
import { fetchWebsiteInsights } from "@/lib/apify";
import { generateProposal } from "@/lib/llm";
import { generateProposalRequestSchema } from "@/lib/types";
import { logDebug, logError } from "@/lib/debug";

export async function POST(request: Request) {
  try {
    const body = generateProposalRequestSchema.parse(await request.json());

    logDebug("api/generate", "Request received", {
      hasUrl: Boolean(body.url),
      url: body.url || null,
    });

    let insights = null;
    try {
      insights = await fetchWebsiteInsights(body.url);
    } catch {
      logError("api/generate", "Continuing without website insights", {
        url: body.url,
      });
      insights = null;
    }

    const prompt = buildProposalPrompt({
      url: body.url,
      insights,
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
