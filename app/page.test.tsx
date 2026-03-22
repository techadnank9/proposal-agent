import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the landing headline and generator controls", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: /proposal agent/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/client website url/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /generate proposal/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /discover businesses/i }),
    ).toHaveAttribute("href", "/discover");
    expect(screen.getByRole("link", { name: /^pricing$/i })).toHaveAttribute(
      "href",
      "/pricing",
    );
    expect(screen.getByText(/proposal agent analyzes the client/i)).toBeInTheDocument();
  });
});
