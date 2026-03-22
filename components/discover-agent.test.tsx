import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DiscoverAgent } from "@/components/discover-agent";

describe("DiscoverAgent", () => {
  it("searches businesses and generates a proposal for a selected lead", async () => {
    const user = userEvent.setup();
    const geolocationMock = vi.fn((success: PositionCallback) =>
      success({
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 1,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({}),
        },
        timestamp: Date.now(),
        toJSON: () => ({}),
      } as GeolocationPosition),
    );

    Object.defineProperty(window.navigator, "geolocation", {
      value: { getCurrentPosition: geolocationMock },
      configurable: true,
    });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          leads: [],
          freeSearchesRemaining: 3,
          hasPaidUnlock: false,
          requiresPayment: false,
          message: "",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          address: {
            city: "San Francisco",
            state: "California",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          leads: [
            {
              name: "Zingari",
              category: "restaurants",
              address: "501 Post St, San Francisco, CA 94102",
              phone: "+1 415-885-8850",
              email: "ciao@zingari.com",
              website: "https://www.zingari.com",
              rating: 4.6,
              reviewsCount: 1204,
              sourceUrl: "https://maps.google.com/example",
              locationText: "San Francisco, CA",
            },
            {
              name: "Sotto Mare",
              category: "restaurants",
              address: "552 Green St, San Francisco, CA 94133",
              phone: "+1 415-398-3181",
              email: "hello@sottomare.com",
              website: "https://www.sottomaresf.com",
              rating: 4.7,
              reviewsCount: 998,
              sourceUrl: "https://maps.google.com/example-2",
              locationText: "San Francisco, CA",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          proposal: {
            intro: "Zingari intro",
            client_understanding: "Zingari understanding",
            problems: ["Problem A"],
            solution: "Zingari solution",
            deliverables: ["Deliverable A"],
            timeline: "10 days",
            pricing: "$4,200",
          },
          insights: {
            businessName: "Zingari",
            phone: "+1 415-885-8850",
            email: "ciao@zingari.com",
            address: "501 Post St, San Francisco, CA 94102",
            services: ["restaurants"],
          },
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    render(<DiscoverAgent />);

    await user.click(screen.getByRole("button", { name: /restaurants/i }));

    await waitFor(() =>
      expect(screen.getByText(/san francisco, california/i)).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: /search businesses/i }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /generate proposal for zingari/i }),
      ).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: /generate proposal for zingari/i }));

    expect(
      screen.getByRole("button", { name: /generate proposal for sotto mare/i }),
    ).toHaveTextContent("Generate");

    await waitFor(() =>
      expect(screen.getByText(/zingari intro/i)).toBeInTheDocument(),
    );

    expect(screen.getByText(/ciao@zingari.com/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy proposal/i })).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it("shows the paywall after quota exhaustion", async () => {
    const user = userEvent.setup();

    Object.defineProperty(window.navigator, "geolocation", {
      value: {
        getCurrentPosition: vi.fn((success: PositionCallback) =>
          success({
            coords: {
              latitude: 37.7749,
              longitude: -122.4194,
              accuracy: 1,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
              toJSON: () => ({}),
            },
            timestamp: Date.now(),
            toJSON: () => ({}),
          } as GeolocationPosition),
        ),
      },
      configurable: true,
    });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          leads: [],
          freeSearchesRemaining: 0,
          hasPaidUnlock: false,
          requiresPayment: false,
          message: "",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          address: {
            city: "San Francisco",
            state: "California",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 402,
        json: async () => ({
          leads: [],
          freeSearchesRemaining: 0,
          hasPaidUnlock: false,
          requiresPayment: true,
          message: "You have used your 3 free searches. Buy access to continue.",
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    render(<DiscoverAgent />);

    await user.click(screen.getByRole("button", { name: /search businesses/i }));

    await waitFor(() =>
      expect(screen.getByText(/3 free searches used/i)).toBeInTheDocument(),
    );

    expect(screen.getByRole("button", { name: /buy access/i })).toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});
