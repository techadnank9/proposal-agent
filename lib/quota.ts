import { createHmac, timingSafeEqual } from "node:crypto";

import {
  discoveryQuotaStateSchema,
  type DiscoveryQuotaState,
} from "@/lib/types";

const COOKIE_NAME = "proposal_agent_discovery_quota";
const FREE_DISCOVERY_SEARCHES = 3;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function getSigningSecret() {
  return (
    process.env.QUOTA_SIGNING_SECRET ||
    process.env.STRIPE_SECRET_KEY ||
    "proposal-agent-dev-secret"
  );
}

function sign(value: string) {
  return createHmac("sha256", getSigningSecret()).update(value).digest("hex");
}

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) {
    return {};
  }

  return Object.fromEntries(
    cookieHeader.split(";").map((segment) => {
      const [rawKey, ...rawValue] = segment.trim().split("=");
      return [rawKey, rawValue.join("=")];
    }),
  );
}

function encodeState(state: DiscoveryQuotaState) {
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decodeState(value: string | undefined): DiscoveryQuotaState {
  if (!value) {
    return discoveryQuotaStateSchema.parse({});
  }

  const [payload, signature] = value.split(".");
  if (!payload || !signature) {
    return discoveryQuotaStateSchema.parse({});
  }

  const expectedSignature = sign(payload);
  const isValid =
    signature.length === expectedSignature.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

  if (!isValid) {
    return discoveryQuotaStateSchema.parse({});
  }

  try {
    return discoveryQuotaStateSchema.parse(
      JSON.parse(Buffer.from(payload, "base64url").toString("utf8")),
    );
  } catch {
    return discoveryQuotaStateSchema.parse({});
  }
}

export function getDiscoveryQuotaState(cookieHeader: string | null) {
  const cookies = parseCookieHeader(cookieHeader);
  return decodeState(cookies[COOKIE_NAME]);
}

export function getFreeSearchesRemaining(state: DiscoveryQuotaState) {
  if (state.hasPaidUnlock) {
    return 0;
  }

  return Math.max(0, FREE_DISCOVERY_SEARCHES - state.freeSearchesUsed);
}

export function canUseFreeSearch(state: DiscoveryQuotaState) {
  return state.hasPaidUnlock || state.freeSearchesUsed < FREE_DISCOVERY_SEARCHES;
}

export function incrementDiscoverySearch(state: DiscoveryQuotaState): DiscoveryQuotaState {
  if (state.hasPaidUnlock) {
    return state;
  }

  return discoveryQuotaStateSchema.parse({
    ...state,
    freeSearchesUsed: state.freeSearchesUsed + 1,
  });
}

export function createPaidUnlockState() {
  return discoveryQuotaStateSchema.parse({
    freeSearchesUsed: FREE_DISCOVERY_SEARCHES,
    hasPaidUnlock: true,
  });
}

export function serializeDiscoveryQuotaCookie(state: DiscoveryQuotaState) {
  return [
    `${COOKIE_NAME}=${encodeState(state)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
    `Max-Age=${COOKIE_MAX_AGE}`,
  ].join("; ");
}

export function getDiscoveryQuotaCookieName() {
  return COOKIE_NAME;
}

export function getFreeDiscoveryLimit() {
  return FREE_DISCOVERY_SEARCHES;
}
