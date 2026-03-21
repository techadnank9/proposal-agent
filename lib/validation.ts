import { proposalSchema, type Proposal } from "@/lib/types";

function extractJsonObject(input: string) {
  const first = input.indexOf("{");
  const last = input.lastIndexOf("}");

  if (first === -1 || last === -1 || last <= first) {
    throw new Error("Model response did not contain a JSON object.");
  }

  return input.slice(first, last + 1);
}

export function parseProposalResponse(input: string): Proposal {
  const raw = extractJsonObject(input);
  const parsed = JSON.parse(raw);
  return proposalSchema.parse(parsed);
}
