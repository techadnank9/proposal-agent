"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Proposal } from "@/lib/types";

type ProposalPreviewDialogProps = {
  proposal: Proposal;
};

export function ProposalPreviewDialog({
  proposal,
}: ProposalPreviewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        Preview full proposal
      </DialogTrigger>
      <DialogContent className="max-w-3xl rounded-[28px] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Proposal preview</DialogTitle>
          <DialogDescription>
            Read the full proposal as one clean client-facing draft.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] space-y-6 overflow-y-auto px-6 pb-6 text-sm leading-7 text-stone-700">
          <section>
            <h3 className="font-medium text-stone-950">Intro</h3>
            <p>{proposal.intro}</p>
          </section>
          <section>
            <h3 className="font-medium text-stone-950">Client understanding</h3>
            <p>{proposal.client_understanding}</p>
          </section>
          <section>
            <h3 className="font-medium text-stone-950">Problems</h3>
            <ul className="list-disc pl-6">
              {proposal.problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="font-medium text-stone-950">Solution</h3>
            <p>{proposal.solution}</p>
          </section>
          <section>
            <h3 className="font-medium text-stone-950">Deliverables</h3>
            <ul className="list-disc pl-6">
              {proposal.deliverables.map((deliverable) => (
                <li key={deliverable}>{deliverable}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="font-medium text-stone-950">Timeline</h3>
            <p>{proposal.timeline}</p>
          </section>
          <section>
            <h3 className="font-medium text-stone-950">Pricing</h3>
            <p>{proposal.pricing}</p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
