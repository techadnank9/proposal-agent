import { POST } from "@/app/api/discover/route";

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
  it("returns normalized lead results", async () => {
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
    };

    expect(response.status).toBe(200);
    expect(payload.leads[0].name).toBe("Zingari");
    expect(payload.leads[0].phone).toContain("415");
  });
});
