import { POST } from "@/app/api/billing/checkout/route";

vi.mock("@/lib/billing", () => ({
  createDiscoveryCheckoutSession: vi.fn(async () => ({
    id: "cs_test_123",
    url: "https://checkout.stripe.com/test-session",
  })),
}));

describe("POST /api/billing/checkout", () => {
  it("returns a checkout session url", async () => {
    const response = await POST(
      new Request("http://localhost/api/billing/checkout", {
        method: "POST",
      }),
    );

    const payload = (await response.json()) as { url: string; sessionId: string };
    expect(response.status).toBe(200);
    expect(payload.url).toContain("checkout.stripe.com");
    expect(payload.sessionId).toBe("cs_test_123");
  });
});
