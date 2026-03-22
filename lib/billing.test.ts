vi.mock("stripe", () => {
  return {
    default: class MockStripe {
      checkout = {
        sessions: {
          create: vi.fn(async () => ({
            id: "cs_test_123",
            url: "https://checkout.stripe.com/test-session",
          })),
          retrieve: vi.fn(async () => ({
            mode: "payment",
            payment_status: "paid",
            metadata: { kind: "discovery_unlock" },
          })),
        },
      };
    },
  };
});

describe("billing helpers", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      STRIPE_SECRET_KEY: "sk_test_123",
      STRIPE_DISCOVERY_UNLOCK_PRICE_ID: "price_123",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("creates a checkout session", async () => {
    const { createDiscoveryCheckoutSession } = await import("@/lib/billing");
    const session = await createDiscoveryCheckoutSession("http://localhost:3000");

    expect(session.url).toContain("checkout.stripe.com");
  });

  it("verifies a paid discovery session", async () => {
    const { verifyDiscoveryCheckoutSession } = await import("@/lib/billing");

    await expect(verifyDiscoveryCheckoutSession("cs_test_123")).resolves.toBe(true);
  });
});
