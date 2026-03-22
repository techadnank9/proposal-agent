import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

function getStripeClient() {
  if (!stripe) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  return stripe;
}

function getBaseUrl(requestUrl?: string) {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    (requestUrl ? new URL(requestUrl).origin : "http://localhost:3000")
  );
}

export async function createDiscoveryCheckoutSession(requestUrl?: string) {
  const priceId = process.env.STRIPE_DISCOVERY_UNLOCK_PRICE_ID;
  if (!priceId) {
    throw new Error("Missing STRIPE_DISCOVERY_UNLOCK_PRICE_ID.");
  }

  const appUrl = getBaseUrl(requestUrl);

  return getStripeClient().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/discover?billing=cancelled`,
    metadata: {
      kind: "discovery_unlock",
    },
  });
}

export async function verifyDiscoveryCheckoutSession(sessionId: string) {
  const session = await getStripeClient().checkout.sessions.retrieve(sessionId);

  return (
    session.mode === "payment" &&
    session.payment_status === "paid" &&
    session.metadata?.kind === "discovery_unlock"
  );
}
