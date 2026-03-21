import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the landing headline and generator controls", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: /generate client-winning proposals in seconds/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/client website/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /generate proposal/i }),
    ).toBeInTheDocument();
  });
});
