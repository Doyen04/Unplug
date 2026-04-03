# Unplug — AI Development Instructions

## Project Overview

**Unplug** is a personal finance web app that detects, scores, and helps users cancel unused subscriptions. It is NOT a generic budgeting app. The core value proposition is brutal honesty about subscription waste, delivered with dark wit and visual personality.

Target users: Financially aware 25–40 year olds who know they're wasting money but haven't dealt with it.

---

## Tech Stack

```text
Framework:     Next.js 14 (App Router)
Language:      TypeScript (strict mode — no any)
Styling:       Tailwind CSS + CSS custom properties
State:         Zustand
Data fetching: TanStack Query (React Query)
Bank data:     Plaid Link (US) / Mono (Africa/Nigeria)
Auth:          Clerk
Database:      Supabase (PostgreSQL)
AI layer:      LLM provider API (model configurable)
Animations:    Framer Motion
Icons:         Lucide React only — no emoji in UI components
```

## Commands

```bash
dev:       npm run dev          # starts on localhost:3000
build:     npm run build
typecheck: npm run typecheck    # run before every commit
test:      npm run test
lint:      npm run lint
```

---

## Architecture Rules

### File Structure

```text
src/
  app/                  # Next.js App Router pages
  components/
    ui/                 # Primitive components (Button, Badge, Card)
    features/           # Feature-specific components
      dashboard/
      subscriptions/
      alerts/
      debrief/
  lib/
    plaid/              # Plaid integration helpers
    ai/                 # AI enrichment helpers
    supabase/           # DB client and queries
    utils/              # Pure utility functions
  hooks/                # Custom React hooks
  stores/               # Zustand stores
  types/                # Shared TypeScript types
```

### Naming Conventions

- Components: PascalCase (`SubscriptionRow.tsx`)
- Hooks: camelCase with `use` prefix (`useSubscriptions.ts`)
- Stores: camelCase with `Store` suffix (`subscriptionStore.ts`)
- API routes: kebab-case (`/api/detect-subscriptions`)
- DB tables: snake_case (`subscription_records`)

### TypeScript Rules

- Strict mode is ON — no `any`, no `@ts-ignore`
- All API responses must be typed via Zod schemas before use
- Database row types must come from Supabase generated types
- Props interfaces named `[ComponentName]Props`

### State Management

- Server state (API data): TanStack Query
- Client/UI state: Zustand stores
- Form state: React Hook Form
- Never use React Context for data — only for theme/config

---

## AI Integration

The AI API is used for three specific tasks only:

1. **Subscription enrichment** — categorize ambiguous merchant names
2. **Usage scoring** — score likelihood of non-use from transaction signals
3. **Monthly debrief** — generate plain-English narrative summary

### AI API Rules

- Model: use `AI_MODEL` environment variable for all calls
- Max tokens: 500 for enrichment, 300 for debrief
- Always wrap calls in try/catch — never let AI errors break the UI
- Never send raw PII to AI APIs — anonymize user IDs before sending
- Always validate and parse AI responses with Zod before use
- AI calls happen server-side only (Next.js API routes) — never client-side

### Prompt Files

All AI prompts live in `src/lib/ai/prompts/`. Never hardcode prompts inline in components or API routes. Import from prompt files.

---

## Database Schema Principles

- Every table has `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
- Every table has `created_at timestamptz DEFAULT now()`
- Every table has `updated_at timestamptz DEFAULT now()`
- Soft delete only — never hard delete subscription records (add `deleted_at`)
- RLS (Row Level Security) enabled on ALL tables
- Users can only access their own data

---

## Key Features — Implementation Notes

### Subscription Detection

Detection pipeline runs on transaction data from Plaid:

1. Filter for recurring charges (same merchant, ±5% amount, monthly/weekly cadence)
2. Enrich with AI API to normalize merchant names and assign category
3. Score usage likelihood using signals (see USAGE_SIGNALS.md)
4. Store enriched records in `subscription_records` table

### Usage Signal Logic

See `src/lib/usage-signals/` for signal weights. Signals are:

- `transaction_gap`: days since last charge vs. expected cadence
- `email_signal`: detected re-engagement emails from provider
- `app_installed`: whether app is detected on device (optional, requires permission)
- `user_checkin`: self-reported monthly yes/no
- `secondary_activity`: related in-app purchases or upgrades

Never claim certainty — always show confidence level (High/Medium/Low) in the UI.

### Alert System

Alerts are generated nightly by a Supabase Edge Function:

- `trial_ending`: trial converts to paid within 72 hours
- `price_hike`: charge amount increased vs. last month
- `dormant`: usage score drops below threshold
- `long_dormant`: no usage signals for 90+ days

---

## Testing Requirements

- Unit tests for all utility functions in `src/lib/utils/`
- Integration tests for all API routes
- Never mock the Plaid or AI API in unit tests — use recorded fixtures
- Test coverage must stay above 70%

---

## Security Rules

- Never log transaction data or user financial details
- Never expose Plaid access tokens client-side
- Clerk handles all auth — never roll custom auth
- All API routes must verify Clerk session before executing
- Sanitize all user inputs before passing to Supabase queries
- Rate limit AI endpoints: max 10 requests per user per minute

---

## Performance Rules

- All data fetching uses TanStack Query with proper cache keys
- Subscription list is paginated (20 per page)
- Images use Next.js `<Image>` with proper dimensions
- No blocking operations on the main thread
- Target: < 2s initial load on 3G connection

---

## What NOT to Do

- Do NOT add features not in this spec without asking
- Do NOT use `console.log` in production code — use the logger utility
- Do NOT hardcode any API keys or secrets — use environment variables
- Do NOT create components larger than 200 lines — split them
- Do NOT duplicate logic — if used twice, extract to a hook or util
- Do NOT use `!important` in CSS
- Do NOT add new dependencies without checking `DEPENDENCIES.md` first
- Do NOT write inline styles in JSX — use Tailwind classes
- Do NOT skip error boundaries around AI-powered components
