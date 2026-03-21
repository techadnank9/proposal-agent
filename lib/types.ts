import { z } from "zod";

export const proposalSchema = z.object({
  intro: z.string().min(1),
  client_understanding: z.string().min(1),
  problems: z.array(z.string().min(1)).min(1),
  solution: z.string().min(1),
  deliverables: z.array(z.string().min(1)).min(1),
  timeline: z.string().min(1),
  pricing: z.string().min(1),
});

export const generateProposalRequestSchema = z.object({
  url: z.string().trim().min(1, "Client website URL is required."),
});

export const websiteInsightsSchema = z.object({
  title: z.string().default(""),
  description: z.string().default(""),
  services: z.array(z.string()).default([]),
  businessName: z.string().default(""),
  phone: z.string().default(""),
  email: z.string().default(""),
  address: z.string().default(""),
  rawText: z.string().default(""),
  sourceUrl: z.string().default(""),
});

export type Proposal = z.infer<typeof proposalSchema>;
export type GenerateProposalRequest = z.infer<typeof generateProposalRequestSchema>;
export type WebsiteInsights = z.infer<typeof websiteInsightsSchema>;
