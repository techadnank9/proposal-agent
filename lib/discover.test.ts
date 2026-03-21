import { normalizeGoogleMapsLead } from "@/lib/discover";

describe("discover helpers", () => {
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
});
