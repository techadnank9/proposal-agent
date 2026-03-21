"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowUpRightIcon,
  CheckCircle2Icon,
  SparklesIcon,
  Globe2Icon,
  FileTextIcon,
} from "lucide-react";

import { LoadingState } from "@/components/loading-state";
import { ProposalResults } from "@/components/proposal-results";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { logClientDebug, logClientError } from "@/lib/debug";
import type { Proposal, WebsiteInsights } from "@/lib/types";

type GenerateResponse = {
  proposal: Proposal;
  insights?: WebsiteInsights | null;
};

export function ProposalAgent() {
  const [url, setUrl] = useState("");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [insights, setInsights] = useState<WebsiteInsights | null>(null);

  async function handleGenerate() {
    if (!url.trim()) {
      logClientError("ui/generate", "Blocked empty URL submission");
      setError("Add a client website URL to generate a proposal.");
      return;
    }

    logClientDebug("ui/generate", "Submitting proposal request", {
      url,
    });

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
        }),
      });

      const payload = (await response.json()) as GenerateResponse & {
        error?: string;
      };

      logClientDebug("ui/generate", "Received API response", {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        throw new Error(payload.error || "Failed to generate proposal.");
      }

      setProposal(payload.proposal);
      setInsights(payload.insights ?? null);
      logClientDebug("ui/generate", "Proposal rendered successfully", {
        hasInsights: Boolean(payload.insights),
        problemCount: payload.proposal.problems.length,
        deliverableCount: payload.proposal.deliverables.length,
      });
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to generate proposal.";
      logClientError("ui/generate", "Proposal generation failed", {
        message,
      });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleGenerate();
  }

  return (
    <main className="min-h-screen px-5 py-8 md:px-8 md:py-10 lg:px-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-7">
        <section className="flex w-full flex-col items-center gap-5 text-center">
          <Badge
            variant="outline"
            className="rounded-full border-amber-900/10 bg-white/70 px-4 py-1.5 text-[11px] uppercase tracking-[0.32em] text-stone-700 shadow-sm"
          >
            AI proposals with live client context
          </Badge>
          <div className="space-y-5">
            <h1 className="mx-auto max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-stone-950 md:text-7xl">
              Proposal Agent
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-stone-700 md:text-xl">
              Proposal Agent analyzes the client, distills the opportunity, and
              returns an editable proposal you can actually send.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-stone-700">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/10 bg-white/75 px-4 py-2 shadow-sm backdrop-blur">
              <Globe2Icon className="size-4" />
              Website context via Apify
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/10 bg-white/75 px-4 py-2 shadow-sm backdrop-blur">
              <SparklesIcon className="size-4" />
              Structured AI proposal
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/10 bg-white/75 px-4 py-2 shadow-sm backdrop-blur">
              <FileTextIcon className="size-4" />
              Editable final draft
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/discover"
              className="inline-flex h-11 items-center rounded-full border border-amber-900/10 bg-white/85 px-5 text-stone-900 shadow-sm transition-colors hover:bg-white"
            >
              <span className="inline-flex items-center gap-2">
                Discover businesses
                <ArrowUpRightIcon className="size-4" />
              </span>
            </Link>
          </div>
        </section>

        <section id="generator" className="w-full">
          <Card className="mx-auto w-full overflow-hidden rounded-[34px] border border-amber-900/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(251,245,236,0.98))] text-stone-900 shadow-[0_28px_120px_rgba(46,22,0,0.12)]">
            <CardContent className="mx-auto w-full max-w-4xl px-6 py-5 md:px-8">
              <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end md:gap-4">
                <div className="grid gap-2">
                  <label htmlFor="url" className="text-sm font-medium text-stone-700">
                    Client website URL
                  </label>
                  <Input
                    id="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://client.com"
                    className="h-12 rounded-[18px] border-amber-900/10 bg-white px-4 text-stone-900 placeholder:text-stone-400 shadow-sm"
                  />
                </div>
                <Button
                  size="lg"
                  className="h-12 rounded-[18px] bg-stone-950 px-6 text-white hover:bg-stone-800 md:min-w-[220px]"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? "Analyzing client..." : "Generate Proposal"}
                  <ArrowUpRightIcon />
                </Button>
              </div>
              {error ? (
                <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}
              </form>
            </CardContent>
          </Card>
        </section>

        <section className="w-full">
          {isLoading ? (
            <LoadingState />
          ) : proposal ? (
            <ProposalResults
              proposal={proposal}
              insights={insights}
              onProposalChange={setProposal}
            />
          ) : (
            <Card className="rounded-[32px] border-dashed border-amber-900/15 bg-white/65 text-center shadow-[0_20px_70px_rgba(45,20,0,0.06)]">
              <CardContent className="flex flex-col items-center gap-4 px-6 py-14">
                <div className="rounded-full bg-stone-950 p-3 text-amber-200 shadow-lg">
                  <CheckCircle2Icon className="size-5" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-stone-950">
                    Generate a proposal to see editable sections
                  </h2>
                  <p className="mx-auto max-w-2xl text-base leading-7 text-stone-600">
                    Once you submit the client briefing, Proposal Agent will show
                    business insights, key problems, a persuasive solution, deliverables,
                    pricing, and a full editable draft in one place.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}
