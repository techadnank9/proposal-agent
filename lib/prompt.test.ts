import { buildProposalPrompt } from "@/lib/prompt";
import { parseProposalResponse } from "@/lib/validation";

describe("proposal prompt helpers", () => {
  it("includes website insights in the prompt", () => {
    const prompt = buildProposalPrompt({
      url: "https://acme.com",
      insights: {
        title: "Acme Studio",
        description: "Creative growth studio for B2B SaaS teams.",
        services: ["branding", "conversion optimization"],
        rawText: "Creative growth studio",
        sourceUrl: "https://acme.com",
      },
    });

    expect(prompt).toContain("Acme Studio");
    expect(prompt).toContain("conversion optimization");
    expect(prompt).toContain("https://acme.com");
  });

  it("parses proposal JSON from a model response", () => {
    const result = parseProposalResponse(`
Here is your proposal:
{
  "intro": "Hi there",
  "client_understanding": "You need growth help",
  "problems": ["Low conversion clarity"],
  "solution": "Refine positioning and funnel copy",
  "deliverables": ["Positioning audit"],
  "timeline": "2 weeks",
  "pricing": "$2,500 fixed"
}`);

    expect(result.problems).toEqual(["Low conversion clarity"]);
    expect(result.pricing).toBe("$2,500 fixed");
  });
});
