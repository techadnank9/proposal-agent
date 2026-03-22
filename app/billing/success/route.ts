import { verifyDiscoveryCheckoutSession } from "@/lib/billing";
import { createPaidUnlockState, serializeDiscoveryQuotaCookie } from "@/lib/quota";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");

  if (!sessionId) {
    return Response.redirect(new URL("/discover?billing=invalid", request.url), 302);
  }

  const isValid = await verifyDiscoveryCheckoutSession(sessionId);

  if (!isValid) {
    return Response.redirect(new URL("/discover?billing=invalid", request.url), 302);
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL("/discover?billing=success", request.url).toString(),
      "Set-Cookie": serializeDiscoveryQuotaCookie(createPaidUnlockState()),
    },
  });
}
