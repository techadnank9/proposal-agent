import { POST } from "@/app/api/generate/route";
import type { Proposal } from "@/lib/types";
import { fetchWebsiteInsights } from "@/lib/apify";

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
    vi.clearAllMocks();
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

  it("returns proposal JSON for a selected lead without a website", async () => {
    const response = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          lead: {
            name: "Zingari",
            category: "restaurants",
            address: "501 Post St, San Francisco, CA 94102",
            phone: "+1 415-885-8850",
            email: "ciao@zingari.com",
            website: "",
            rating: 4.6,
            reviewsCount: 1204,
            sourceUrl: "https://maps.google.com/example",
            locationText: "San Francisco, CA",
          },
        }),
      }),
    );

    const payload = (await response.json()) as {
      proposal: Proposal;
      insights: { businessName: string; phone: string; email: string };
    };

    expect(response.status).toBe(200);
    expect(payload.proposal.pricing).toBe("$3,000");
    expect(payload.insights.businessName).toBe("Zingari");
    expect(payload.insights.phone).toContain("415");
    expect(payload.insights.email).toBe("ciao@zingari.com");
  });

  it("does not call website crawling for a selected lead with a website", async () => {
    const response = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          lead: {
            name: "Fairmont San Francisco",
            category: "hotels",
            address: "950 Mason St, San Francisco, CA 94108",
            phone: "+1 415-772-5000",
            email: "reservations@fairmont.com",
            website: "https://www.fairmont.com/san-francisco/",
            rating: 4.5,
            reviewsCount: 3200,
            sourceUrl: "https://maps.google.com/example-fairmont",
            locationText: "San Francisco, California",
          },
        }),
      }),
    );

    const payload = (await response.json()) as {
      proposal: Proposal;
      insights: { businessName: string; phone: string; email: string };
    };

    expect(response.status).toBe(200);
    expect(payload.insights.businessName).toBe("Fairmont San Francisco");
    expect(fetchWebsiteInsights).not.toHaveBeenCalledWith(
      "https://www.fairmont.com/san-francisco/",
    );
  });
});
