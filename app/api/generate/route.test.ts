import { POST } from "@/app/api/generate/route";
import type { Proposal } from "@/lib/types";

const mockProposal: Proposal = {
  intro: "Intro",
  client_understanding: "Understanding",
  problems: ["Problem A"],
  solution: "Solution",
  deliverables: ["Deliverable A"],
  timeline: "2 weeks",
  pricing: "$3,000",
};

vi.mock("@/lib/apify", () => ({
  fetchWebsiteInsights: vi.fn(async () => ({
    title: "Acme",
    description: "A SaaS company",
    services: ["seo"],
    rawText: "A SaaS company",
    sourceUrl: "https://acme.com",
  })),
}));

vi.mock("@/lib/llm", () => ({
  generateProposal: vi.fn(async () => mockProposal),
}));

describe("POST /api/generate", () => {
  const debugSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  afterEach(() => {
    debugSpy.mockClear();
    errorSpy.mockClear();
  });

  afterAll(() => {
    debugSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("rejects empty requests", async () => {
    const response = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ url: "" }),
      }),
    );

    expect(response.status).toBe(500);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("returns proposal JSON for valid input", async () => {
    const response = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          url: "https://acme.com",
        }),
      }),
    );

    const payload = (await response.json()) as {
      proposal: Proposal;
      insights: { title: string };
    };

    expect(response.status).toBe(200);
    expect(payload.proposal.pricing).toBe("$3,000");
    expect(payload.insights.title).toBe("Acme");
    expect(debugSpy).toHaveBeenCalled();
  });
});
