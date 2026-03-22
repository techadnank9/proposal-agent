import { createDiscoveryCheckoutSession } from "@/lib/billing";
import { logError } from "@/lib/debug";

export async function POST(request: Request) {
  try {
    const session = await createDiscoveryCheckoutSession(request.url);

    return Response.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Billing checkout failed.";

    logError("api/billing/checkout", "Checkout creation failed", { message });
    return Response.json({ error: message }, { status: 500 });
  }
}
