# Proposal Agent Design

## Goal

Build a polished hackathon MVP that generates highly personalized freelance proposals from either a client website URL, a job description, or both.

## Product Scope

The MVP will include:

- A marketing landing page with a strong headline and CTA.
- A proposal generation workspace with URL and job description inputs.
- A backend generation API that scrapes website content with Apify when a URL is present.
- An LLM-backed proposal generator that returns structured JSON.
- An editable results experience with tabs, cards, copy actions, and full proposal preview.
- Loading skeletons and responsive UI tuned for demo quality.

The MVP will not require authentication or a database. PDF export and proposal scoring are optional stretch goals only if time remains.

## Recommended Architecture

Use a single Next.js App Router application with server API routes.

Why:

- Fastest path to a complete demo.
- Minimal deployment and configuration overhead.
- Great fit for shadcn/ui and Tailwind.
- Keeps frontend, API, and shared types in one codebase.

## Tech Choices

- Framework: Next.js with App Router
- Styling: Tailwind CSS
- UI kit: shadcn/ui components installed via MCP
- Backend: Next.js route handlers
- AI: OpenAI-compatible chat completions API
- Scraping: Apify Actor API using a public website content actor
- Storage: in-memory browser state only for MVP

## UX Design

The app should feel like a modern SaaS product with a calm, premium layout.

- Landing section at the top with headline, supporting copy, and CTA.
- Main generator section below with clearly separated input and output areas.
- Soft neutral palette, strong typography, generous spacing, subtle gradients.
- Responsive grid that becomes a single column on mobile.
- Immediate visual feedback when generation starts.

Mandatory shadcn components to use:

- `button`
- `card`
- `input`
- `textarea`
- `tabs`
- `dialog`
- `skeleton`
- `badge`

## User Flow

1. User lands on the page and clicks the CTA.
2. User enters a website URL, a job description, or both.
3. User clicks Generate Proposal.
4. Frontend sends a POST request to `/api/generate`.
5. Backend optionally scrapes website content through Apify.
6. Backend normalizes scraped insights and combines them with the job description.
7. Backend prompts the LLM to return strict proposal JSON.
8. Frontend renders the result in editable sections and tabbed views.
9. User copies individual sections or opens the full preview dialog.

## Backend Design

### Route

`POST /api/generate`

### Input

```json
{
  "url": "",
  "jobDescription": ""
}
```

### Processing Steps

1. Validate that at least one of `url` or `jobDescription` is provided.
2. If `url` is provided, call an Apify website scraping Actor.
3. Extract or infer:
   - page title
   - meta description or summary
   - likely services
   - positioning cues
4. Merge website context with the job description.
5. Send a structured prompt to the LLM.
6. Parse and validate the JSON response.
7. Return the proposal payload plus optional metadata about the extracted source context.

### Output

```json
{
  "intro": "",
  "client_understanding": "",
  "problems": [],
  "solution": "",
  "deliverables": [],
  "timeline": "",
  "pricing": ""
}
```

## Scraping Strategy

Use Apify for live website extraction when a URL is present. The backend helper will:

- trigger a public Actor run
- wait for completion
- collect dataset items
- reduce noisy content into concise fields needed for proposal generation

If scraping fails, the API should continue using only the job description when available. This keeps the demo resilient.

## AI Prompting Strategy

The prompt should instruct the model to:

- personalize the proposal using real website insights
- sound like an experienced freelancer
- be concise, persuasive, and business-aware
- return valid JSON only

The backend should use a schema-aware parsing path when possible, or a strict JSON parse fallback with validation.

## Frontend Output Design

### Tabs

- Summary
- Problems
- Proposal

### Summary Tab

Cards for:

- intro
- client understanding
- solution
- timeline
- pricing

### Problems Tab

Card with editable list of identified client problems.

### Proposal Tab

Editable textareas for all proposal sections with:

- copy button per section
- preview button opening a full dialog

## Error Handling

- Show inline validation if both inputs are empty.
- Show a friendly error banner if generation fails.
- Fallback gracefully when Apify data is partial.
- Prevent malformed model output from crashing the UI with server-side validation.

## Testing Strategy

Focus on high-value tests for MVP confidence:

- unit tests for request validation and prompt input shaping
- unit tests for JSON normalization/parsing
- API route tests for success and validation failures
- component tests for loading state and editable proposal rendering

## Demo Priorities

The demo should highlight three things clearly:

1. Real-time website enrichment through Apify
2. Structured AI-generated output
3. Polished editable SaaS-style interface built with shadcn/ui

## Delivery Plan

Build in this order:

1. Scaffold Next.js app with Tailwind
2. Install required shadcn components
3. Create shared proposal types and helpers
4. Implement and test the generation API
5. Implement the landing and generator UI
6. Add loading, preview dialog, and copy interactions
7. Verify the local run path and document setup
