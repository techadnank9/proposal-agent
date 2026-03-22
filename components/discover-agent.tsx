"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  MapPinIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react";

import { LoadingState } from "@/components/loading-state";
import { ProposalResults } from "@/components/proposal-results";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { logClientDebug, logClientError } from "@/lib/debug";
import type {
  BusinessLead,
  DiscoverBusinessesResponse,
  Proposal,
  WebsiteInsights,
} from "@/lib/types";

const CATEGORY_PRESETS = [
  "Restaurants",
  "Hotels",
  "Bars",
  "Coffee",
  "Takeout",
  "Grocery",
  "Dentists",
  "Gyms",
];

const DEFAULT_LOCATION = "San Francisco, California";

async function reverseGeocode(latitude: number, longitude: number) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
  );

  if (!response.ok) {
    throw new Error("Reverse geocoding failed.");
  }

  const payload = (await response.json()) as {
    display_name?: string;
    address?: {
      city?: string;
      town?: string;
      county?: string;
      state?: string;
    };
  };

  const city =
    payload.address?.city ?? payload.address?.town ?? payload.address?.county ?? "";
  const state = payload.address?.state ?? "";

  return [city, state].filter(Boolean).join(", ") || payload.display_name || "";
}

type GenerateResponse = {
  proposal: Proposal;
  insights?: WebsiteInsights | null;
};

export function DiscoverAgent() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("Restaurants");
  const [locationText, setLocationText] = useState(DEFAULT_LOCATION);
  const [locationStatus, setLocationStatus] = useState(DEFAULT_LOCATION);
  const [searchError, setSearchError] = useState("");
  const [generateError, setGenerateError] = useState("");
  const [billingError, setBillingError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [activeLeadKey, setActiveLeadKey] = useState<string | null>(null);
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [insights, setInsights] = useState<WebsiteInsights | null>(null);
  const [freeSearchesRemaining, setFreeSearchesRemaining] = useState<number>(3);
  const [hasPaidUnlock, setHasPaidUnlock] = useState(false);
  const [requiresPayment, setRequiresPayment] = useState(false);
  const [billingMessage, setBillingMessage] = useState("");

  const effectiveCategory = useMemo(() => selectedCategory, [selectedCategory]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationText(DEFAULT_LOCATION);
      setLocationStatus(DEFAULT_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const resolvedLocation = await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude,
          );
          if (resolvedLocation) {
            setLocationText((current) => current || resolvedLocation);
            setLocationStatus(resolvedLocation);
          } else {
            setLocationText(DEFAULT_LOCATION);
            setLocationStatus(DEFAULT_LOCATION);
          }
        } catch {
          setLocationText(DEFAULT_LOCATION);
          setLocationStatus(DEFAULT_LOCATION);
        }
      },
      () => {
        setLocationText(DEFAULT_LOCATION);
        setLocationStatus(DEFAULT_LOCATION);
      },
      { timeout: 5000 },
    );
  }, []);

  useEffect(() => {
    async function loadQuota() {
      try {
        const response = await fetch("/api/discover", { method: "GET" });
        const payload = (await response.json()) as DiscoverBusinessesResponse;
        setFreeSearchesRemaining(payload.freeSearchesRemaining);
        setHasPaidUnlock(payload.hasPaidUnlock);
      } catch {
        // Keep defaults for demo resiliency.
      }
    }

    void loadQuota();
  }, []);

  useEffect(() => {
    const billingStatus = searchParams?.get("billing");

    if (billingStatus === "success") {
      setHasPaidUnlock(true);
      setRequiresPayment(false);
      setBillingMessage("Access unlocked for this browser. You can keep searching.");
    } else if (billingStatus === "cancelled") {
      setBillingMessage("Checkout cancelled. Your 3 free searches are still available.");
    } else if (billingStatus === "invalid") {
      setBillingError("We could not verify the payment session.");
    }
  }, [searchParams]);

  async function handleSearch() {
    if (!effectiveCategory.trim() || !locationText.trim()) {
      setSearchError("Choose a category and location to search nearby businesses.");
      return;
    }

    logClientDebug("ui/discover", "Searching business leads", {
      category: effectiveCategory,
      locationText,
    });

    setSearchError("");
    setGenerateError("");
    setBillingError("");
    setProposal(null);
    setInsights(null);
    setIsSearching(true);

    try {
      const response = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: effectiveCategory.toLowerCase(),
          locationText,
        }),
      });

      const payload = (await response.json()) as DiscoverBusinessesResponse & {
        error?: string;
      };

      setFreeSearchesRemaining(payload.freeSearchesRemaining);
      setHasPaidUnlock(payload.hasPaidUnlock);
      setRequiresPayment(payload.requiresPayment);
      setBillingMessage(payload.message || "");

      if (response.status === 402 || payload.requiresPayment) {
        setLeads([]);
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error || "Failed to discover businesses.");
      }

      setLeads(payload.leads ?? []);
      setRequiresPayment(false);
      if (!payload.leads?.length) {
        setSearchError("No businesses found for this category and location.");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to discover businesses.";
      logClientError("ui/discover", "Business search failed", { message });
      setSearchError(message);
      setLeads([]);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleBuyAccess() {
    setBillingError("");
    setIsStartingCheckout(true);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
      });

      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Failed to start checkout.");
      }

      window.location.assign(payload.url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to start checkout.";
      logClientError("ui/discover", "Checkout start failed", { message });
      setBillingError(message);
    } finally {
      setIsStartingCheckout(false);
    }
  }

  async function handleGenerateForLead(lead: BusinessLead) {
    const leadKey = `${lead.name}-${lead.address}`;
    setGenerateError("");
    setIsGenerating(true);
    setActiveLeadKey(leadKey);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead }),
      });

      const payload = (await response.json()) as GenerateResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to generate proposal.");
      }

      setProposal(payload.proposal);
      setInsights(payload.insights ?? null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate proposal.";
      logClientError("ui/discover", "Lead proposal generation failed", { message });
      setGenerateError(message);
    } finally {
      setIsGenerating(false);
      setActiveLeadKey(null);
    }
  }

  return (
    <main className="min-h-screen px-5 py-8 md:px-8 md:py-10 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-7">
        <section className="space-y-4 text-center">
          <Badge
            variant="outline"
            className="rounded-full border-amber-900/10 bg-white/70 px-4 py-1.5 text-[11px] uppercase tracking-[0.32em] text-stone-700 shadow-sm"
          >
            Google Maps lead discovery
          </Badge>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-stone-950 md:text-6xl">
            Discover local businesses and generate a proposal
          </h1>
          <p className="mx-auto max-w-3xl text-base leading-7 text-stone-700 md:text-lg">
            Pick a category, use your current location, choose a business from the
            shortlist, and generate the same proposal workflow from Google Maps data.
          </p>
        </section>

        <Card className="rounded-[32px] border border-amber-900/10 bg-white/94 shadow-[0_20px_80px_rgba(33,19,0,0.08)]">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {CATEGORY_PRESETS.map((preset) => {
                const isActive = selectedCategory.toLowerCase() === preset.toLowerCase();

                return (
                  <Button
                    key={preset}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    className={
                      isActive
                        ? "h-14 rounded-full px-6 text-center text-[1.05rem] shadow-sm"
                        : "h-14 rounded-full border-stone-200 bg-stone-50/70 px-6 text-center text-[1.05rem] text-stone-900 hover:bg-stone-100"
                    }
                    onClick={() => {
                      setSelectedCategory(preset);
                    }}
                  >
                    {preset}
                  </Button>
                );
              })}
            </div>
            <div className="flex flex-col gap-4 pt-2 md:flex-row md:items-center md:justify-between">
              <div className="inline-flex items-center gap-3 text-lg text-stone-600">
                <MapPinIcon className="size-5" />
                <span>{locationText || locationStatus || DEFAULT_LOCATION}</span>
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <p className="text-sm text-stone-600">
                  {hasPaidUnlock
                    ? "Unlimited searches unlocked in this browser."
                    : `${freeSearchesRemaining} free searches remaining`}
                </p>
                <Button
                  type="button"
                  className="h-14 rounded-full bg-stone-950 px-8 text-lg text-white hover:bg-stone-800"
                  onClick={handleSearch}
                  disabled={isSearching || !locationText.trim()}
                >
                  {isSearching ? "Searching..." : "Search businesses"}
                  <SearchIcon />
                </Button>
              </div>
            </div>
            {requiresPayment ? (
              <Card className="rounded-[26px] border border-amber-900/10 bg-amber-50/70 shadow-none">
                <CardContent className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-stone-950">
                      3 free searches used
                    </p>
                    <p className="text-sm leading-6 text-stone-700">
                      {billingMessage ||
                        "Buy access to unlock unlimited discovery searches in this browser."}
                    </p>
                  </div>
                  <Button
                    type="button"
                    className="rounded-full bg-stone-950 px-6 text-white hover:bg-stone-800"
                    onClick={handleBuyAccess}
                    disabled={isStartingCheckout}
                  >
                    {isStartingCheckout ? "Opening checkout..." : "Buy access"}
                    <SparklesIcon />
                  </Button>
                </CardContent>
              </Card>
            ) : null}
            {searchError ? (
              <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {searchError}
              </div>
            ) : null}
            {billingError ? (
              <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {billingError}
              </div>
            ) : null}
            {billingMessage && !requiresPayment ? (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {billingMessage}
              </div>
            ) : null}
          </CardHeader>
        </Card>

        {leads.length > 0 ? (
          <Card className="rounded-[30px] border-white/60 bg-white/92 shadow-[0_20px_80px_rgba(33,19,0,0.08)]">
            <CardHeader>
              <CardTitle>Business matches</CardTitle>
              <CardDescription>
                Choose a business to generate client insights and a proposal.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {leads.map((lead) => {
                const leadKey = `${lead.name}-${lead.address}`;
                const isLeadGenerating = isGenerating && activeLeadKey === leadKey;

                return (
                  <div
                    key={leadKey}
                    className="grid gap-4 rounded-[22px] border border-stone-200/70 bg-stone-50/88 p-4 md:grid-cols-[minmax(0,1fr)_auto]"
                  >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-stone-950">{lead.name}</p>
                      {lead.rating ? (
                        <Badge variant="secondary" className="rounded-full">
                          {lead.rating.toFixed(1)} stars
                        </Badge>
                      ) : null}
                      {lead.reviewsCount ? (
                        <Badge variant="secondary" className="rounded-full">
                          {lead.reviewsCount} reviews
                        </Badge>
                      ) : null}
                    </div>
                    <div className="grid gap-1 text-sm text-stone-600">
                      <p>{lead.address || "Address not found"}</p>
                      <p>{lead.phone || "Phone not found"}</p>
                      <p className="break-all">{lead.website || "Website not found"}</p>
                    </div>
                  </div>
                  <div className="flex items-start justify-end md:self-center">
                    <Button
                      type="button"
                      className="rounded-full"
                      aria-label={`Generate proposal for ${lead.name}`}
                      onClick={() => handleGenerateForLead(lead)}
                      disabled={isLeadGenerating}
                    >
                      {isLeadGenerating ? "Generating..." : "Generate"}
                      <SparklesIcon />
                    </Button>
                  </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ) : null}

        {generateError ? (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {generateError}
          </div>
        ) : null}

        {isGenerating ? <LoadingState /> : null}

        {proposal ? (
          <ProposalResults
            proposal={proposal}
            insights={insights}
            onProposalChange={setProposal}
          />
        ) : null}
      </div>
    </main>
  );
}
