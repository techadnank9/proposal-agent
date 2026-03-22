import { GET } from "@/app/billing/success/route";

vi.mock("@/lib/billing", () => ({
  verifyDiscoveryCheckoutSession: vi.fn(async () => true),
}));

describe("GET /billing/success", () => {
  it("sets the paid unlock cookie and redirects to discover", async () => {
    const response = await GET(
      new Request("http://localhost/billing/success?session_id=cs_test_123"),
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toContain("/discover?billing=success");
    expect(response.headers.get("set-cookie")).toContain("proposal_agent_discovery_quota=");
  });
});
