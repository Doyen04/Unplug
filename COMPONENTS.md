# Component Patterns — Subscription Graveyard

Read DESIGN.md first. These patterns implement the design system in code.
Every component in this project follows these exact patterns.

---

## Non-negotiable Component Rules

1. Arrow function syntax: `const MyComponent = (props: Props) => { ... }`
2. Named props interface: `interface MyComponentProps { ... }`
3. Under 200 lines — split if larger
4. Tailwind only — no inline styles (exception: dynamic values like shame score color)
5. No `any` in props or internal types
6. Error boundaries around all data-fetching and AI-powered components
7. Every interactive element has an accessible `aria-label` if icon-only

---

## ShameScore

The dashboard centerpiece. Implemented as an SVG ring with a counting number.

```tsx
interface ShameScoreMeterProps {
  score: number;           // 0–100
  previousScore?: number;
  isLoading?: boolean;
}

// Color interpolation for the score
function getScoreColor(score: number): string {
  if (score >= 70) return '#E53434';  // --danger
  if (score >= 40) return '#E8860A';  // --warning
  return '#1C9E5B';                   // --success
}

// Sub-label copy based on score range
function getScoreLabel(score: number): string {
  if (score >= 80) return "Ouch. Let's fix this.";
  if (score >= 60) return "Some room to improve.";
  if (score >= 40) return "Getting better.";
  if (score >= 20) return "Nearly there.";
  return "Clean slate. Nice work.";
}

// SVG ring: 200px diameter, 12px stroke width, animates stroke-dashoffset
// Number: Playfair Display Black 72px, color interpolated from getScoreColor()
// Label: Plus Jakarta Sans 500 11px uppercase tracking-widest text-text-muted
// Sub-label: Plus Jakarta Sans 400 13px text-text-secondary mt-2
// Animate: useEffect count from previousScore to score using requestAnimationFrame
```

---

## StatCard

```tsx
interface StatCardProps {
  label: string;
  value: string;      // pre-formatted: "$147", "3", "$1,764/yr"
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    text: string;     // e.g. "↑ $12 more than last month"
    isGood: boolean;  // true = green, false = red
  };
  variant?: 'default' | 'danger' | 'success';
}

// Card: white bg, 1px border border-color-border, rounded-card, p-6, shadow-card
// Label: text-sm font-medium uppercase tracking-[0.05em] text-text-muted mb-2
// Value: text-2xl font-bold font-display
//   danger variant:  text-[--danger]
//   success variant: text-[--success]
//   default:         text-text-primary
// Trend: text-sm mt-1, colored based on isGood (green/red) + direction arrow
```

---

## SubscriptionRow

```tsx
interface SubscriptionRowProps {
  subscription: {
    id: string;
    name: string;
    category: string;
    amount: number;
    frequency: 'monthly' | 'weekly' | 'annual';
    status: 'active' | 'unused' | 'trial-ending' | 'price-hike' | 'cancelled';
    alertMessage?: string;
    brandColor?: string;  // from BRAND_COLORS map
    usageScore?: number;
    lastCharge?: Date;
  };
  onCancel: (id: string) => Promise<void>;
}

// Row outer: flex items-center gap-3 px-4 py-[18px] border-b border-border
//   last-child: no bottom border
//   cancelled: bg-bg-muted opacity-60 pointer-events-none
//   unused: border-l-[3px] border-l-[--danger]
//   trial-ending | price-hike: border-l-[3px] border-l-[--warning]

// Service avatar: 40x40, rounded-[10px], bg from brandColor or default warm gray
//   Letter: Playfair Display 700, 18px, white, centered

// Info section (flex-1):
//   Name: text-base font-medium text-text-primary
//   Meta: text-sm text-text-muted (e.g. "Monthly · Since Mar 2024")
//   Alert badge: shown below meta if status !== 'active'

// Amount section (text-right, flex-shrink-0):
//   Amount: font-display font-bold text-base text-text-primary
//   Frequency: text-xs text-text-muted

// Cancel button: btn-cancel style, hidden when cancelled
//   Shows "Cancelling..." spinner during in-flight request
//   Shows "✓ Cancelled" green text after success
```

---

## AlertBadge

```tsx
type AlertType = 'unused' | 'trial-ending' | 'price-hike' | 'dormant';

interface AlertBadgeProps {
  type: AlertType;
  message: string;
}

// All: inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5
//      text-[11px] font-semibold uppercase tracking-[0.05em]

// unused:       bg-[--danger-light]  text-[--danger]
// trial-ending: bg-[--warning-light] text-[--warning]
// price-hike:   bg-[--warning-light] text-[--warning]
// dormant:      bg-[--danger-light]  text-[--danger]
```

---

## DebriefPanel

The AI-generated monthly narrative. Styled like a premium letter, not a chat bubble.

```tsx
interface DebriefPanelProps {
  month: string;
  isLoading: boolean;
  debrief: { summary: string; action: string; sentiment: string } | null;
  error: boolean;
  onGenerate: () => void;
}

// Outer card: white, rounded-card, shadow-card, p-6
// Header row: flex justify-between items-center mb-4
//   Left: "Monthly Debrief" — text-lg font-medium text-text-primary
//   Right: month — text-sm text-text-muted

// Loading state (isLoading=true):
//   Three animated dots: inline flex gap-1
//   Each dot: w-2 h-2 rounded-full bg-brand, animate-bounce with stagger delay
//   Text below: "Gemini is analysing your subscriptions..." text-sm text-text-muted

// Content (debrief !== null):
//   Summary paragraph: text-base text-text-primary leading-relaxed font-ui
//   Divider: border-t border-border my-3
//   Action line: flex items-start gap-2
//     Icon: Lightbulb from lucide, 16px, text-brand
//     Text: text-sm font-medium text-text-primary

// Empty state (debrief === null && !isLoading && !error):
//   Centered: sparkles icon, "Get your monthly debrief" heading, generate button

// Error state:
//   Centered: text-sm text-text-secondary "Couldn't generate your debrief."
//   Retry button (ghost style)
```

---

## FilterPills

```tsx
type FilterType = 'all' | 'unused' | 'trial' | 'hike';

interface FilterPillsProps {
  active: FilterType;
  counts: Record<FilterType, number>;
  onChange: (filter: FilterType) => void;
}

// Container: flex gap-2 flex-wrap
// Each pill: inline-flex items-center gap-1.5 rounded-pill px-4 py-1.5
//   Inactive: border border-border bg-white text-text-secondary text-sm font-medium
//   Active:   bg-text-primary text-white border-text-primary
//   Count badge inside: text-xs opacity-60 (inactive) or opacity-70 (active)
// Transition: all 150ms ease on background/color
```

---

## Loading States

**Never use:** spinning loaders, pulsing skeleton bars in gray.

**Use instead:**

```tsx
// Subscription list loading — rows with shimmer
const SubscriptionSkeleton = () => (
  <div className="animate-pulse space-y-0">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-4 py-[18px] border-b border-border">
        <div className="w-10 h-10 rounded-[10px] bg-bg-subtle" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-bg-subtle rounded w-32" />
          <div className="h-3 bg-bg-subtle rounded w-20" />
        </div>
        <div className="h-5 bg-bg-subtle rounded w-16" />
      </div>
    ))}
  </div>
);

// Shame score loading
const ShameScoreSkeleton = () => (
  <div className="flex flex-col items-center gap-3 animate-pulse">
    <div className="w-[200px] h-[200px] rounded-full bg-bg-subtle" />
    <div className="h-4 w-28 bg-bg-subtle rounded" />
  </div>
);

// AI debrief loading — use the animated dots pattern, not a spinner
```

---

## Error States

```tsx
// Inline component error (not full page)
const InlineError = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="rounded-tag border border-[color:var(--danger)] bg-[color:var(--danger-light)] p-4">
    <p className="text-sm font-medium text-[color:var(--danger)]">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="text-sm text-[color:var(--danger)] underline mt-1">
        Try again
      </button>
    )}
  </div>
);
```

---

## Toast Notifications

Use `sonner` for toasts (add to DEPENDENCIES.md):

```tsx
import { toast } from 'sonner';

// Success — after cancellation
toast.success(`Cancelled ${name}!`, {
  description: `You'll save $${annualSaving.toFixed(0)}/year`,
  duration: 4000,
});

// Undo — 5 second window after cancel
toast.success('Cancelled!', {
  action: {
    label: 'Undo',
    onClick: () => handleUndo(subscriptionId),
  },
  duration: 5000,
});

// Error
toast.error('Something went wrong', {
  description: 'Please try again in a moment',
});
```

---

## Framer Motion Usage

```tsx
// Staggered list entrance
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden:  { opacity: 0, y: 16 },
  show:    { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] } },
};

// Cancel row animation
const rowVariants = {
  active:    { x: 0, opacity: 1 },
  cancelled: { opacity: 0.6, transition: { duration: 0.4 } },
};

// Stat card number count (use useMemo + useEffect with RAF, not a library)
```

---

## Drizzle Schema Shape (reference for component types)

```typescript
// src/db/schema.ts — abridged
export const subscriptions = pgTable('subscriptions', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      text('user_id').notNull(),          // Clerk user ID
  name:        text('name').notNull(),              // normalized service name
  rawMerchant: text('raw_merchant').notNull(),      // original from Plaid
  category:    text('category').notNull(),
  amount:      numeric('amount', { precision: 10, scale: 2 }).notNull(),
  frequency:   text('frequency').notNull(),         // 'monthly' | 'weekly' | 'annual'
  status:      text('status').notNull(),            // 'active' | 'unused' | etc.
  usageScore:  integer('usage_score'),
  lastCharge:  timestamp('last_charge'),
  alertType:   text('alert_type'),
  alertMsg:    text('alert_message'),
  cancelledAt: timestamp('cancelled_at'),
  deletedAt:   timestamp('deleted_at'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
```
