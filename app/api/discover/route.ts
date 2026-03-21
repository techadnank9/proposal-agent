import { fetchGoogleMapsLeads } from "@/lib/discover";
import { discoverBusinessesRequestSchema } from "@/lib/types";
import { logDebug, logError } from "@/lib/debug";

export async function POST(request: Request) {
  try {
    const body = discoverBusinessesRequestSchema.parse(await request.json());

    logDebug("api/discover", "Request received", body);

    const leads = await fetchGoogleMapsLeads(body.category, body.locationText);

    return Response.json({ leads });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Business discovery failed.";

    logError("api/discover", "Request failed", { message });
    return Response.json({ error: message }, { status: 500 });
  }
}
