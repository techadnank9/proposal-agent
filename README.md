# Proposal Agent

Proposal Agent is a demo-ready SaaS MVP that generates personalized freelance proposals from a client website URL using live website context.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- shadcn/ui
- Apify API
- Stripe Checkout
- OpenAI-compatible chat completions API
- Vitest + Testing Library

## Features

- Landing page with startup-style hero and CTA
- URL input
- Google Maps business discovery page
- 3 free discovery searches per browser
- Stripe checkout unlock for unlimited discovery in that browser
- `POST /api/generate` backend route
- Apify-powered website enrichment
- Structured AI proposal output
- Editable proposal tabs
- Copy actions for each section
- Full proposal preview dialog
- Skeleton loading state

## Project Structure

```text
proposal-agent/
├── app/
│   ├── api/generate/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── loading-state.tsx
│   ├── proposal-agent.tsx
│   ├── proposal-editor.tsx
│   ├── proposal-preview-dialog.tsx
│   └── ui/
├── docs/plans/
├── lib/
│   ├── apify.ts
│   ├── llm.ts
│   ├── prompt.ts
│   ├── types.ts
│   ├── utils.ts
│   └── validation.ts
├── .env.example
└── README.md
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

- `APIFY_API_TOKEN`
- `APIFY_ACTOR_ID`
- `APIFY_GOOGLE_MAPS_ACTOR_ID`
- `APIFY_EMAIL_ACTOR_ID`
- `STRIPE_SECRET_KEY`
- `STRIPE_DISCOVERY_UNLOCK_PRICE_ID`
- `NEXT_PUBLIC_APP_URL`
- `OPENROUTER_API_KEY`
- `OPENROUTER_BASE_URL`
- `OPENROUTER_MODEL`

For OpenRouter, the recommended config is:

```bash
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=Proposal Agent
PROPOSAL_AGENT_DEBUG=true
NEXT_PUBLIC_PROPOSAL_AGENT_DEBUG=true
```

For the discovery paywall:

```bash
STRIPE_SECRET_KEY=sk_live_or_test_key
STRIPE_DISCOVERY_UNLOCK_PRICE_ID=price_123
NEXT_PUBLIC_APP_URL=https://your-deployed-domain.com
QUOTA_SIGNING_SECRET=long_random_secret
```

For email enrichment in discovery results, the app uses this actor by default:

```bash
APIFY_EMAIL_ACTOR_ID=s-r~free-email-domain-scraper
```

The app also still supports `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and `OPENAI_MODEL` for direct OpenAI-style providers.

Logging:

- `PROPOSAL_AGENT_DEBUG=true` keeps server logs visible in local and deployed environments
- `NEXT_PUBLIC_PROPOSAL_AGENT_DEBUG=true` keeps browser-console logs visible in the deployed app
- set either one to `false` if you want to silence that side

## Local Setup

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Contract

`POST /api/generate`

Request:

```json
{
  "url": "https://client.com",
  "url": "https://client.com"
}
```

Response:

```json
{
  "proposal": {
    "intro": "",
    "client_understanding": "",
    "problems": [],
    "solution": "",
    "deliverables": [],
    "timeline": "",
    "pricing": ""
  },
  "insights": {
    "title": "",
    "description": "",
    "services": []
  }
}
```

## Notes

- If Apify scraping fails, the route still attempts generation using the submitted client URL context and provider prompt defaults.
- `/discover` uses 3 free searches per browser cookie before showing a Stripe Checkout paywall.
- The UI uses shadcn components for all core controls and containers required by the brief.
- This MVP uses no database so the editing flow stays fast and local.
