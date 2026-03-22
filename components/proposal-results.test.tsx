import { render, screen } from "@testing-library/react";

import { ProposalResults } from "@/components/proposal-results";
import type { Proposal, WebsiteInsights } from "@/lib/types";

const proposal: Proposal = {
  intro: "Hello there",
  client_understanding: "You need clearer positioning.",
  problems: ["Low conversion"],
  solution: "Refresh the website messaging.",
  deliverables: ["Homepage rewrite"],
  timeline: "2 weeks",
  pricing: "$2,500",
};

const insights: WebsiteInsights = {
  title: "Acme",
  description: "A service business",
  services: ["messaging"],
  businessName: "Acme",
  phone: "",
  email: "hello@acme.com",
  address: "",
  rawText: "",
  sourceUrl: "",
};

describe("ProposalResults", () => {
  it("renders an email action when a business email exists", () => {
    render(
      <ProposalResults
        proposal={proposal}
        insights={insights}
        onProposalChange={() => {}}
      />,
    );

    expect(screen.getByRole("link", { name: /send proposal by email/i })).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:hello%40acme.com"),
    );
  });
});
