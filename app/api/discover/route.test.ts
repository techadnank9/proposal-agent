import { GET, POST } from "@/app/api/discover/route";

vi.mock("@/lib/discover", () => ({
  fetchGoogleMapsLeads: vi.fn(async () => [
    {
      name: "Zingari",
      category: "restaurants",
      address: "501 Post St, San Francisco, CA 94102",
      phone: "+1 415-885-8850",
      email: "ciao@zingari.com",
      website: "https://www.zingari.com",
      rating: 4.6,
      reviewsCount: 1204,
      sourceUrl: "https://maps.google.com/example",
      locationText: "San Francisco, CA",
    },
  ]),
}));

describe("POST /api/discover", () => {
  it("returns normalized lead results and quota info", async () => {
    const response = await POST(
      new Request("http://localhost/api/discover", {
        method: "POST",
        body: JSON.stringify({
          category: "restaurants",
          locationText: "San Francisco, CA",
        }),
      }),
    );

    const payload = (await response.json()) as {
      leads: Array<{ name: string; phone: string }>;
      freeSearchesRemaining: number;
    };

    expect(response.status).toBe(200);
    expect(payload.leads[0].name).toBe("Zingari");
    expect(payload.leads[0].phone).toContain("415");
    expect(payload.freeSearchesRemaining).toBe(2);
    expect(response.headers.get("set-cookie")).toContain("proposal_agent_discovery_quota=");
  });

  it("blocks the fourth search for the same browser cookie", async () => {
    let cookieHeader: string | null = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await POST(
        new Request("http://localhost/api/discover", {
          method: "POST",
          headers: cookieHeader ? { cookie: cookieHeader } : {},
          body: JSON.stringify({
            category: "restaurants",
            locationText: "San Francisco, CA",
          }),
        }),
      );

      cookieHeader = response.headers.get("set-cookie");
    }

    const blocked = await POST(
      new Request("http://localhost/api/discover", {
        method: "POST",
        headers: cookieHeader ? { cookie: cookieHeader } : {},
        body: JSON.stringify({
          category: "restaurants",
          locationText: "San Francisco, CA",
        }),
      }),
    );

    const payload = (await blocked.json()) as {
      requiresPayment: boolean;
      freeSearchesRemaining: number;
    };

    expect(blocked.status).toBe(402);
    expect(payload.requiresPayment).toBe(true);
    expect(payload.freeSearchesRemaining).toBe(0);
  });

  it("returns fresh free searches for a new cookie jar", async () => {
    const response = await GET(
      new Request("http://localhost/api/discover", {
        method: "GET",
      }),
    );

    const payload = (await response.json()) as {
      freeSearchesRemaining: number;
      hasPaidUnlock: boolean;
    };

    expect(response.status).toBe(200);
    expect(payload.freeSearchesRemaining).toBe(3);
    expect(payload.hasPaidUnlock).toBe(false);
  });
});
