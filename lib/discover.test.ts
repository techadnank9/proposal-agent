import { fetchGoogleMapsLeads, normalizeGoogleMapsLead } from "@/lib/discover";

describe("discover helpers", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      APIFY_API_TOKEN: "apify_test_token",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("normalizes actor lead output into app shape", () => {
    const lead = normalizeGoogleMapsLead(
      {
        "Business Name": "Zingari",
        "Business Address": "501 Post St, San Francisco, CA 94102",
        Website: "https://www.zingari.com",
        Phone: "+1 415-885-8850",
        Emails: ["ciao@zingari.com"],
        Rating: 4.6,
        Reviews: 1204,
        Category: "Restaurant",
        "Google Maps URL": "https://maps.google.com/example",
      },
      "restaurants",
      "San Francisco, CA",
    );

    expect(lead.name).toBe("Zingari");
    expect(lead.address).toContain("San Francisco");
    expect(lead.phone).toContain("415");
    expect(lead.email).toBe("ciao@zingari.com");
    expect(lead.website).toBe("https://www.zingari.com");
    expect(lead.category).toBe("restaurants");
    expect(lead.locationText).toBe("San Francisco, CA");
    expect(lead.sourceUrl).toContain("maps.google.com");
  });

  it("enriches missing lead emails from the email actor", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            "Business Name": "Fairmont San Francisco",
            "Business Address": "950 Mason St, San Francisco, CA 94108",
            Website: "https://www.fairmont.com/san-francisco/",
            Phone: "+1 415-772-5000",
            Rating: 4.5,
            Reviews: 3200,
            "Google Maps URL": "https://maps.google.com/fairmont",
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            domain: "fairmont.com",
            email: "reservations@fairmont.com",
          },
        ],
      });

    const leads = await fetchGoogleMapsLeads(
      "hotels",
      "San Francisco, California",
      fetchMock as typeof fetch,
    );

    expect(leads[0]?.email).toBe("reservations@fairmont.com");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
