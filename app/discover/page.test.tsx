import { render, screen } from "@testing-library/react";
import DiscoverPage from "./page";

describe("DiscoverPage", () => {
  it("renders the discovery workflow", () => {
    render(<DiscoverPage />);

    expect(
      screen.getByRole("heading", { name: /discover local businesses/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /restaurants/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search businesses/i })).toBeInTheDocument();
  });
});
