import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProposalAgent } from "@/components/proposal-agent";

describe("ProposalAgent", () => {
  it("starts with a real empty state and no prefilled proposal copy", () => {
    render(<ProposalAgent />);

    expect(screen.getByLabelText(/client website url/i)).toBeInTheDocument();
    expect(screen.getByText(/generate a proposal to see editable sections/i)).toBeInTheDocument();
    expect(screen.queryByText(/thanks for sharing the opportunity/i)).not.toBeInTheDocument();
  });

  it("shows a validation message when inputs are empty", async () => {
    const user = userEvent.setup();
    render(<ProposalAgent />);

    await user.click(screen.getByRole("button", { name: /generate proposal/i }));

    expect(
      screen.getByText(/add a client website url to generate a proposal/i),
    ).toBeInTheDocument();
  });

  it("renders generated proposal data after a successful request", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        proposal: {
          intro: "Custom intro",
          client_understanding: "Custom understanding",
          problems: ["Problem A", "Problem B"],
          solution: "Custom solution",
          deliverables: ["Deliverable A"],
          timeline: "10 days",
          pricing: "$4,200",
        },
        insights: {
          title: "Acme",
          description: "B2B SaaS consultancy",
          services: ["seo"],
        },
      }),
    }));

    vi.stubGlobal("fetch", fetchMock);

    render(<ProposalAgent />);

    await user.type(screen.getByLabelText(/client website url/i), "https://acme.com");
    await user.click(screen.getByRole("button", { name: /generate proposal/i }));

    await waitFor(() =>
      expect(screen.getByText(/custom intro/i)).toBeInTheDocument(),
    );

    expect(screen.getByText(/acme/i)).toBeInTheDocument();
    expect(screen.getByText(/\$4,200/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /copy proposal/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit proposal/i })).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it("submits when pressing enter in the URL field", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        proposal: {
          intro: "Keyboard intro",
          client_understanding: "Keyboard understanding",
          problems: ["Problem A"],
          solution: "Keyboard solution",
          deliverables: ["Deliverable A"],
          timeline: "7 days",
          pricing: "$2,000",
        },
        insights: {
          title: "Keyboard Co",
          description: "Test company",
          services: ["seo"],
        },
      }),
    }));

    vi.stubGlobal("fetch", fetchMock);

    render(<ProposalAgent />);

    const input = screen.getByLabelText(/client website url/i);
    await user.type(input, "https://keyboard.example{enter}");

    await waitFor(() =>
      expect(screen.getByText(/keyboard intro/i)).toBeInTheDocument(),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });
});
