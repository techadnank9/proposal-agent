import { render, screen } from "@testing-library/react";

import PricingPage from "./page";

describe("PricingPage", () => {
  it("renders the pricing plans and discovery CTA", () => {
    render(<PricingPage />);

    expect(
      screen.getByRole("heading", { name: /simple pricing for discovery/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^free$/i)).toBeInTheDocument();
    expect(screen.getByText(/^starter$/i)).toBeInTheDocument();
    expect(screen.getByText(/^growth$/i)).toBeInTheDocument();
    expect(screen.getByText(/^9 searches$/i)).toBeInTheDocument();
    expect(screen.getByText(/^19 searches$/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /coming soon|start free/i }).length).toBeGreaterThan(0);
  });
});
