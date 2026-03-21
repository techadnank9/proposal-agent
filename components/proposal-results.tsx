"use client";

import { useState } from "react";
import { CopyIcon, PencilIcon } from "lucide-react";

import { ProposalEditor } from "@/components/proposal-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { logClientDebug, logClientError } from "@/lib/debug";
import type { Proposal, WebsiteInsights } from "@/lib/types";

type ProposalResultsProps = {
  proposal: Proposal;
  insights: WebsiteInsights | null;
  onProposalChange: (proposal: Proposal) => void;
};

export function ProposalResults({
  proposal,
  insights,
  onProposalChange,
}: ProposalResultsProps) {
  const [isEditing, setIsEditing] = useState(false);

  function buildFinalProposalText(currentProposal: Proposal) {
    return [
      currentProposal.intro,
      "",
      "My Understanding of Your Business",
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

  return (
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
          <ProposalEditor proposal={proposal} onChange={onProposalChange} />
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
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(buildFinalProposalText(proposal));
                      logClientDebug("ui/proposal", "Copied final proposal");
                    } catch (error) {
                      logClientError("ui/proposal", "Failed to copy proposal", {
                        message: error instanceof Error ? error.message : String(error),
                      });
                    }
                  }}
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
                  <li key={deliverable} className="text-base leading-8 text-stone-700">
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
  );
}
