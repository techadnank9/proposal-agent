import { fetchGoogleMapsLeads } from "@/lib/discover";
import { discoverBusinessesRequestSchema } from "@/lib/types";
import { logDebug, logError } from "@/lib/debug";
import {
  canUseFreeSearch,
  getDiscoveryQuotaState,
  getFreeSearchesRemaining,
  incrementDiscoverySearch,
  serializeDiscoveryQuotaCookie,
} from "@/lib/quota";

export async function GET(request: Request) {
  const quotaState = getDiscoveryQuotaState(request.headers.get("cookie"));

  return Response.json({
    leads: [],
    freeSearchesRemaining: getFreeSearchesRemaining(quotaState),
    hasPaidUnlock: quotaState.hasPaidUnlock,
    requiresPayment: false,
    message: "",
  });
}

export async function POST(request: Request) {
  try {
    const body = discoverBusinessesRequestSchema.parse(await request.json());
    const quotaState = getDiscoveryQuotaState(request.headers.get("cookie"));

    logDebug("api/discover", "Request received", body);

    if (!canUseFreeSearch(quotaState)) {
      return Response.json(
        {
          leads: [],
          freeSearchesRemaining: 0,
          hasPaidUnlock: false,
          requiresPayment: true,
          message: "You have used your 3 free searches. Buy access to continue.",
        },
        { status: 402 },
      );
    }

    const leads = await fetchGoogleMapsLeads(body.category, body.locationText);
    const nextQuotaState = incrementDiscoverySearch(quotaState);
    const response = Response.json({
      leads,
      freeSearchesRemaining: getFreeSearchesRemaining(nextQuotaState),
      hasPaidUnlock: nextQuotaState.hasPaidUnlock,
      requiresPayment: false,
      message: "",
    });

    response.headers.set(
      "Set-Cookie",
      serializeDiscoveryQuotaCookie(nextQuotaState),
    );

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Business discovery failed.";

    logError("api/discover", "Request failed", { message });
    return Response.json({ error: message }, { status: 500 });
  }
}
