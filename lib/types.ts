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

export const businessLeadSchema = z.object({
  name: z.string().trim().min(1),
  category: z.string().trim().default(""),
  address: z.string().trim().default(""),
  phone: z.string().trim().default(""),
  email: z.string().trim().default(""),
  website: z.string().trim().default(""),
  rating: z.number().nullable().optional().default(null),
  reviewsCount: z.number().int().nonnegative().optional().default(0),
  sourceUrl: z.string().trim().default(""),
  locationText: z.string().trim().default(""),
});

export const discoverBusinessesRequestSchema = z.object({
  category: z.string().trim().min(1, "Business category is required."),
  locationText: z.string().trim().min(1, "Location is required."),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const discoveryQuotaStateSchema = z.object({
  freeSearchesUsed: z.number().int().nonnegative().default(0),
  hasPaidUnlock: z.boolean().default(false),
});

export const discoverBusinessesResponseSchema = z.object({
  leads: z.array(businessLeadSchema).default([]),
  freeSearchesRemaining: z.number().int().nonnegative().default(0),
  hasPaidUnlock: z.boolean().default(false),
  requiresPayment: z.boolean().default(false),
  message: z.string().default(""),
});

export const generateProposalFromLeadRequestSchema = z.object({
  lead: businessLeadSchema,
});

export const proposalGenerationRequestSchema = z.union([
  generateProposalRequestSchema,
  generateProposalFromLeadRequestSchema,
]);

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
export type BusinessLead = z.infer<typeof businessLeadSchema>;
export type DiscoverBusinessesRequest = z.infer<typeof discoverBusinessesRequestSchema>;
export type DiscoveryQuotaState = z.infer<typeof discoveryQuotaStateSchema>;
export type DiscoverBusinessesResponse = z.infer<typeof discoverBusinessesResponseSchema>;
export type WebsiteInsights = z.infer<typeof websiteInsightsSchema>;
