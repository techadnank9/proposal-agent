"use client";

import { CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Proposal } from "@/lib/types";

type ProposalEditorProps = {
  proposal: Proposal;
  onChange: (proposal: Proposal) => void;
};

export function ProposalEditor({ proposal, onChange }: ProposalEditorProps) {
  const updateField = (field: keyof Proposal, value: string | string[]) => {
    onChange({
      ...proposal,
      [field]: value,
    });
  };

  const copySection = async (value: string | string[]) => {
    const text = Array.isArray(value) ? value.join("\n") : value;
    await navigator.clipboard.writeText(text);
  };

  const textFields: Array<{
    key: keyof Proposal;
    label: string;
    multiline?: boolean;
  }> = [
    { key: "intro", label: "Intro" },
    {
      key: "client_understanding",
      label: "My Understanding of Your Business",
      multiline: true,
    },
    { key: "solution", label: "Solution", multiline: true },
    { key: "timeline", label: "Timeline" },
    { key: "pricing", label: "Pricing" },
  ];

  return (
    <Card className="rounded-[30px] border-white/60 bg-white/92 shadow-[0_20px_80px_rgba(33,19,0,0.08)]">
      <CardHeader className="flex-row items-center justify-between gap-4 border-b border-stone-200/70 pb-5">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-stone-950 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-amber-100">
            Proposal
          </div>
          <CardTitle className="text-2xl text-stone-950">Full proposal draft</CardTitle>
          <p className="mt-1 text-base text-stone-600">
            Edit the proposal as one continuous client-ready document.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto rounded-full"
          onClick={() =>
            copySection([
              proposal.intro,
              proposal.client_understanding,
              proposal.problems.join("\n"),
              proposal.solution,
              proposal.deliverables.join("\n"),
              proposal.timeline,
              proposal.pricing,
            ])
          }
        >
          <CopyIcon />
          Copy all
        </Button>
      </CardHeader>
      <CardContent className="grid gap-6">
        {textFields.map((field, index) => (
          <section
            key={field.key}
            className="grid gap-3 rounded-[24px] border border-stone-200/70 bg-stone-50/88 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-7 items-center justify-center rounded-full bg-amber-300/45 text-xs font-semibold text-stone-900">
                  {index + 1}
                </div>
                <h3 className="text-sm font-semibold text-stone-900">{field.label}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto rounded-full"
                onClick={() => copySection(proposal[field.key] as string)}
              >
                <CopyIcon />
                Copy
              </Button>
            </div>
            <Textarea
              value={proposal[field.key] as string}
              onChange={(event) => updateField(field.key, event.target.value)}
              className={field.multiline ? "min-h-28 rounded-[18px] bg-white" : "min-h-20 rounded-[18px] bg-white"}
            />
          </section>
        ))}

        <section className="grid gap-3 rounded-[24px] border border-stone-200/70 bg-stone-50/88 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-7 items-center justify-center rounded-full bg-amber-300/45 text-xs font-semibold text-stone-900">
                6
              </div>
              <h3 className="text-sm font-semibold text-stone-900">Problems</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto rounded-full"
              onClick={() => copySection(proposal.problems)}
            >
              <CopyIcon />
              Copy
            </Button>
          </div>
          <Textarea
            value={proposal.problems.join("\n")}
            onChange={(event) =>
              updateField(
                "problems",
                event.target.value
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean),
              )
            }
            className="min-h-32 rounded-[18px] bg-white"
          />
        </section>

        <section className="grid gap-3 rounded-[24px] border border-stone-200/70 bg-stone-50/88 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-7 items-center justify-center rounded-full bg-amber-300/45 text-xs font-semibold text-stone-900">
                7
              </div>
              <h3 className="text-sm font-semibold text-stone-900">Deliverables</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto rounded-full"
              onClick={() => copySection(proposal.deliverables)}
            >
              <CopyIcon />
              Copy
            </Button>
          </div>
          <Textarea
            value={proposal.deliverables.join("\n")}
            onChange={(event) =>
              updateField(
                "deliverables",
                event.target.value
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean),
              )
            }
            className="min-h-32 rounded-[18px] bg-white"
          />
        </section>
      </CardContent>
    </Card>
  );
}
