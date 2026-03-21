"use client";

import { useState } from "react";
import {
  ArrowUpRightIcon,
  CheckCircle2Icon,
  CopyIcon,
  PencilIcon,
  SparklesIcon,
  Globe2Icon,
  FileTextIcon,
} from "lucide-react";

import { LoadingState } from "@/components/loading-state";
import { ProposalEditor } from "@/components/proposal-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Proposal } from "@/lib/types";

type GenerateResponse = {
  proposal: Proposal;
  insights?: {
    title?: string;
    description?: string;
    services?: string[];
    businessName?: string;
    phone?: string;
    email?: string;
    address?: string;
  } | null;
};

export function ProposalAgent() {
  const [url, setUrl] = useState("");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [insights, setInsights] = useState<GenerateResponse["insights"]>(null);

  function buildFinalProposalText(currentProposal: Proposal) {
    return [
      currentProposal.intro,
      "",
      "Client understanding",
      currentProposal.client_understanding,
      "",
      "Problems to solve",
      ...currentProposal.problems.map((problem) => `- ${problem}`),
      "",
      "Proposed solution",
      currentProposal.solution,
      "",
      "Deliverables",
      ...currentProposal.deliverables.map((deliverable) => `- ${deliverable}`),
      "",
      `Timeline: ${currentProposal.timeline}`,
      `Pricing: ${currentProposal.pricing}`,
    ].join("\n");
  }

  async function handleGenerate() {
    if (!url.trim()) {
      setError("Add a client website URL to generate a proposal.");
      return;
    }

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

      if (!response.ok) {
        throw new Error(payload.error || "Failed to generate proposal.");
      }

      setProposal(payload.proposal);
      setInsights(payload.insights ?? null);
      setIsEditing(false);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to generate proposal.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
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
        </section>

        <section id="generator" className="w-full">
          <Card className="mx-auto w-full overflow-hidden rounded-[34px] border border-amber-900/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(251,245,236,0.98))] text-stone-900 shadow-[0_28px_120px_rgba(46,22,0,0.12)]">
            <CardContent className="mx-auto grid w-full max-w-4xl gap-4 px-6 py-5 md:px-8">
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
                  onClick={handleGenerate}
                  disabled={isLoading}
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
            </CardContent>
          </Card>
        </section>

        <section className="w-full">
          {isLoading ? (
            <LoadingState />
          ) : proposal ? (
            <div className="grid gap-5">
              {insights ? (
                <Card className="rounded-[30px] border-white/60 bg-white/92 shadow-[0_20px_80px_rgba(33,19,0,0.08)]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-stone-950">Client insights</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-3 rounded-[22px] border border-stone-200/70 bg-stone-50/88 p-4 md:grid-cols-2">
                      {[
                        ["Business name", insights.businessName || insights.title || "Not found"],
                        ["Phone", insights.phone || "Not found"],
                        ["Email", insights.email || "Not found"],
                        ["Address", insights.address || "Not found"],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="grid grid-cols-[140px_1fr] gap-3 border-b border-stone-200/70 py-2 last:border-b-0 md:last:border-b md:[&:nth-last-child(-n+2)]:border-b-0"
                        >
                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
                            {label}
                          </p>
                          <p className="text-sm font-medium text-stone-900">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(insights.services ?? []).map((service) => (
                        <Badge
                          key={service}
                          variant="secondary"
                          className="rounded-full border border-stone-200/70 bg-stone-50 px-3 py-1 text-stone-700"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {isEditing ? (
                <div className="grid gap-4">
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setIsEditing(false)}
                    >
                      Back to final proposal
                    </Button>
                  </div>
                  <ProposalEditor proposal={proposal} onChange={setProposal} />
                </div>
              ) : (
                <Card className="rounded-[30px] border-white/60 bg-white/92 shadow-[0_20px_80px_rgba(33,19,0,0.08)]">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-4">
                      <div className="inline-flex w-fit rounded-full bg-stone-950 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-amber-100">
                        Proposal
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          className="rounded-full"
                          size="icon"
                          aria-label="Copy proposal"
                          onClick={() =>
                            navigator.clipboard.writeText(buildFinalProposalText(proposal))
                          }
                        >
                          <CopyIcon />
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-full"
                          size="icon"
                          aria-label="Edit proposal"
                          onClick={() => setIsEditing(true)}
                        >
                          <PencilIcon />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <section className="space-y-3">
                      <p className="text-base leading-8 text-stone-700">{proposal.intro}</p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                        My Understanding of Your Business
                      </h3>
                      <p className="text-base leading-8 text-stone-700">
                        {proposal.client_understanding}
                      </p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                        Problems to solve
                      </h3>
                      <ul className="space-y-2">
                        {proposal.problems.map((problem) => (
                          <li key={problem} className="text-base leading-8 text-stone-700">
                            - {problem}
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                        Proposed solution
                      </h3>
                      <p className="text-base leading-8 text-stone-700">{proposal.solution}</p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                        Deliverables
                      </h3>
                      <ul className="space-y-2">
                        {proposal.deliverables.map((deliverable) => (
                          <li
                            key={deliverable}
                            className="text-base leading-8 text-stone-700"
                          >
                            - {deliverable}
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="grid gap-6 border-t border-stone-200/70 pt-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                          Timeline
                        </h3>
                        <p className="text-base leading-8 text-stone-700">{proposal.timeline}</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                          Pricing
                        </h3>
                        <p className="text-base leading-8 text-stone-700">{proposal.pricing}</p>
                      </div>
                    </section>
                  </CardContent>
                </Card>
              )}
            </div>
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
