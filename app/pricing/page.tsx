import Link from "next/link";
import { CheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Free",
    price: "$0",
    subtitle: "3 free searches",
    description: "Try Proposal Agent in any new browser before paying.",
    features: [
      "3 free discovery searches per browser",
      "Google Maps business shortlist",
      "Proposal generation after selecting a lead",
    ],
    cta: {
      href: "/discover" as const,
      label: "Start free",
    },
    accent: "stone",
  },
  {
    name: "Starter",
    price: "$9",
    subtitle: "9 searches",
    description: "A simple paid pack for focused prospecting and proposal work.",
    features: [
      "9 discovery searches",
      "Same Google Maps + email enrichment workflow",
      "Fast path for a small batch of leads",
    ],
    cta: {
      href: "/pricing" as const,
      label: "Coming soon",
    },
    accent: "amber",
  },
  {
    name: "Growth",
    price: "$19",
    subtitle: "19 searches",
    description: "More room to explore businesses and build stronger outbound volume.",
    features: [
      "19 discovery searches",
      "Best fit for repeated client outreach",
      "Same proposal generation workflow included",
    ],
    cta: {
      href: "/pricing" as const,
      label: "Coming soon",
    },
    accent: "sage",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen px-5 py-8 md:px-8 md:py-10 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="flex flex-col items-center gap-5 text-center">
          <Badge
            variant="outline"
            className="rounded-full border-amber-900/10 bg-white/70 px-4 py-1.5 text-[11px] uppercase tracking-[0.32em] text-stone-700 shadow-sm"
          >
            Pricing
          </Badge>
          <div className="space-y-4">
            <h1 className="text-5xl font-semibold tracking-[-0.06em] text-stone-950 md:text-7xl">
              Simple pricing for discovery
            </h1>
            <p className="mx-auto max-w-3xl text-base leading-7 text-stone-700 md:text-xl">
              Start with 3 free discovery searches in every new browser, then move
              into simple paid search packs when you need more lead volume.
            </p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className="rounded-[32px] border border-amber-900/10 bg-white/94 shadow-[0_20px_80px_rgba(33,19,0,0.08)]"
            >
              <CardHeader className="space-y-4">
                <div className="space-y-2">
                  <p
                    className="text-sm uppercase tracking-[0.3em] text-stone-500"
                  >
                    {plan.name}
                  </p>
                  <CardTitle className="text-5xl text-stone-950">{plan.price}</CardTitle>
                  <p
                    className={
                      plan.accent === "amber"
                        ? "text-sm font-medium text-amber-700"
                        : plan.accent === "sage"
                          ? "text-sm font-medium text-emerald-700"
                          : "text-sm font-medium text-stone-500"
                    }
                  >
                    {plan.subtitle}
                  </p>
                </div>
                <p className="text-base leading-7 text-stone-700">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="inline-flex items-start gap-3 text-stone-700"
                    >
                      <CheckIcon
                        className={
                          plan.accent === "amber"
                            ? "mt-0.5 size-4 shrink-0 text-amber-700"
                            : plan.accent === "sage"
                              ? "mt-0.5 size-4 shrink-0 text-emerald-700"
                              : "mt-0.5 size-4 shrink-0 text-stone-600"
                        }
                      />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href={plan.cta.href}
                  className={
                    plan.accent === "amber"
                      ? "inline-flex h-12 items-center justify-center rounded-full bg-amber-200 px-6 font-medium text-stone-950 transition-colors hover:bg-amber-300"
                      : plan.accent === "sage"
                        ? "inline-flex h-12 items-center justify-center rounded-full bg-emerald-100 px-6 font-medium text-stone-950 transition-colors hover:bg-emerald-200"
                        : "inline-flex h-12 items-center justify-center rounded-full bg-stone-100 px-6 font-medium text-stone-950 transition-colors hover:bg-stone-200"
                  }
                >
                  {plan.cta.label}
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
