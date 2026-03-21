import { inferServicesFromText, normalizeApifyDatasetItem } from "@/lib/apify";

describe("apify helpers", () => {
  it("infers services from website text", () => {
    expect(
      inferServicesFromText(
        "We offer branding, SEO, web design, and automation for startups.",
      ),
    ).toEqual(["branding", "seo", "web design", "automation"]);
  });

  it("normalizes a dataset item into website insights", () => {
    const insights = normalizeApifyDatasetItem(
      {
        title: "Northstar Digital",
        description: "A conversion studio for SaaS teams.",
        text: "We specialize in conversion optimization and web development. Contact us at hello@northstar.example or (415) 555-0101. Visit 123 Market Street, San Francisco, CA 94105.",
      },
      "https://northstar.example",
    );

    expect(insights.title).toBe("Northstar Digital");
    expect(insights.businessName).toBe("Northstar Digital");
    expect(insights.services).toContain("conversion optimization");
    expect(insights.email).toBe("hello@northstar.example");
    expect(insights.phone).toContain("415");
    expect(insights.address).toContain("San Francisco");
    expect(insights.sourceUrl).toBe("https://northstar.example");
  });
});
