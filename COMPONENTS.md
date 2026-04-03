# Component Patterns — Unplug

AI coding agents: read this before building any UI component.
These patterns are non-negotiable. Deviate only with explicit instruction.

---

## Component Rules

### Every component must

1. Have a named TypeScript interface for props (`ComponentNameProps`)
2. Be a functional component using arrow function syntax
3. Include an error boundary if it fetches data or calls AI
4. Use Tailwind classes — no inline styles, no styled-components
5. Be under 200 lines — split if larger

### Import order (enforced by ESLint)

```typescript
// 1. React
import { useState, useEffect } from 'react'
// 2. External libraries
import { motion } from 'framer-motion'
import { TrendingDown } from 'lucide-react'
// 3. Internal — absolute paths
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { formatCurrency } from '@/lib/utils/format'
// 4. Types
import type { Subscription } from '@/types'
// 5. Styles (if any CSS modules)
import styles from './Component.module.css'
```

---

## Key Components

### SubscriptionRow

The core list item. Used everywhere subscriptions are displayed.

```typescript
interface SubscriptionRowProps {
  subscription: Subscription;
  onCancel: (id: string) => void;
  showAlerts?: boolean;
}

// Status determines left border color via Tailwind:
// unused        → border-l-3 border-red-500
// trial-ending  → border-l-3 border-amber-500
// price-hike    → border-l-3 border-amber-500
// healthy       → border-l-3 border-stone-700
// cancelled     → border-l-3 border-green-600 opacity-50

// Layout: flex row, items-center, gap-3, p-4, bg-stone-900, border border-stone-800
// Left: service icon (letter avatar, not emoji)
// Center: name (15px mono 500), metadata (12px mono secondary), alert badge if present
// Right: amount ($XX.XX, 15px mono), frequency (12px secondary), cancel button
```

### ShameScoreMeter

The dashboard centerpiece. Cannot be a generic progress bar.

```typescript
interface ShameScoreMeterProps {
  score: number;           // 0–100
  previousScore?: number;  // for showing delta
  isLoading?: boolean;
}

// Display:
// - Large number in DM Serif Display, ~72px
// - Color: interpolate from #FF4444 (100) to #C8F135 (0)
//   Use: `style={{ color: interpolateColor(score) }}`
// - Label: "SHAME SCORE" in IBM Plex Mono, 11px, uppercase, letter-spacing 0.08em
// - Delta: show "+5" or "-12" in 14px when previousScore provided
// - Animate: count from 0 to score on mount (600ms, ease-out)
// - Sub-label: contextual message based on score range:
//     80–100: "You should feel bad about this."
//     60–79:  "Room for improvement. Significant room."
//     40–59:  "Mediocre. But fixable."
//     20–39:  "Not bad. Keep going."
//     0–19:   "Respectable. For now."
```

### StatCard

Used in the top summary row. 3 cards: Monthly Spend, Unused Count, Saveable/yr.

```typescript
interface StatCardProps {
  label: string;
  value: string;         // pre-formatted (e.g., "$147", "3", "$1,764")
  variant?: 'default' | 'danger' | 'success';
  delta?: string;        // optional: "+$12 vs last month"
}

// Layout: bg-stone-900, border border-stone-800, p-6, rounded-none (sharp)
// Label: 11px mono, uppercase, letter-spacing 0.08em, text-stone-500
// Value: 36px DM Serif Display
//   danger variant: text-red-500
//   success variant: text-acid-green (#C8F135)
//   default: text-stone-100
// Delta: 12px mono, text-stone-400, margin-top 4px
```

### AlertBadge

Compact status label used inside SubscriptionRow.

```typescript
type AlertType = 'unused' | 'trial-ending' | 'price-hike' | 'dormant';

interface AlertBadgeProps {
  type: AlertType;
  message: string;
}

// All badges: 10px mono, uppercase, letter-spacing 0.08em, px-2 py-0.5, rounded-none
// unused:       bg-red-950 text-red-400 border border-red-800
// trial-ending: bg-amber-950 text-amber-400 border border-amber-800
// price-hike:   bg-amber-950 text-amber-400 border border-amber-800
// dormant:      bg-red-950 text-red-500 border border-red-800
```

### DebriefPanel

The AI-generated monthly narrative. Treat like a receipt, not a chat bubble.

```typescript
interface DebriefPanelProps {
  month: string;
  isLoading: boolean;
  content: string | null;
  error: boolean;
}

// Layout: bg-stone-950, border border-stone-800, p-6
// Header: "MONTHLY DEBRIEF / [MONTH YEAR]" — 11px mono uppercase
// Content: 15px mono, text-stone-300, line-height 1.7
// Loading state: blinking cursor animation (not a spinner)
//   "Analysing your subscriptions_" with blinking underscore
// Error state: "DEBRIEF UNAVAILABLE" in red, no retry button visible
//   (retry is triggered by pressing the generate button again)
```

### CancelButton

Destructive action. Must feel deliberate.

```typescript
interface CancelButtonProps {
  subscriptionId: string;
  serviceName: string;
  onSuccess: () => void;
  disabled?: boolean;
}

// Default: transparent bg, border border-stone-700, text-stone-400, 12px mono, uppercase
// Hover: border-red-700, text-red-400, bg-transparent
// After click: shows "CANCELLING..." for 800ms, then success state
// Never shows a confirmation dialog — the cancel is final
// (cancelled state is reversible for 5 seconds via a toast undo)
```

---

## Loading States

**Never use:** spinning circles, pulsing gray rectangles, generic skeletons

**Use instead:**

```tsx
// Terminal-style loading for subscription list
const TerminalLoader = () => (
  <div className="font-mono text-sm text-stone-500 p-4">
    <span>Scanning transactions</span>
    <span className="animate-blink">_</span>
  </div>
);

// For AI debrief
const DebriefLoader = () => (
  <div className="font-mono text-sm text-stone-500">
    <span>Analysing your subscriptions</span>
    <span className="animate-blink">_</span>
  </div>
);

// CSS for blink animation (add to globals.css):
// @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
// .animate-blink { animation: blink 1s step-end infinite; }
```

---

## Error States

```tsx
// Component-level error (not full page)
const ComponentError = ({ message }: { message: string }) => (
  <div className="border border-red-900 bg-red-950 p-4 font-mono text-xs text-red-400 uppercase tracking-widest">
    ERROR: {message}
  </div>
);
```

---

## Tailwind Custom Config

Add to `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      'acid-green':  '#C8F135',
      'acid-dim':    '#9AB828',
      'acid-muted':  '#1E2A0D',
      stone: {        // extend defaults with app-specific tones
        950: '#0D0D0B',
        900: '#141412',
        850: '#1C1C19',
        800: '#242420',
      }
    },
    fontFamily: {
      mono:    ['IBM Plex Mono', 'Courier New', 'monospace'],
      display: ['DM Serif Display', 'Georgia', 'serif'],
    },
    borderRadius: {
      DEFAULT: '0px',   // override default rounding — we use sharp corners
      sm:      '2px',
      md:      '4px',
    },
    animation: {
      blink: 'blink 1s step-end infinite',
    },
    keyframes: {
      blink: {
        '0%, 100%': { opacity: '1' },
        '50%':       { opacity: '0' },
      }
    }
  }
}
```

---

## Zustand Store Shape

```typescript
// src/stores/subscriptionStore.ts

interface SubscriptionStore {
  subscriptions: Subscription[];
  filter: 'all' | 'unused' | 'trial' | 'hike';
  isLoading: boolean;
  error: string | null;

  // Actions
  setFilter: (filter: SubscriptionStore['filter']) => void;
  cancelSubscription: (id: string) => void;
  undoCancel: (id: string) => void;
  refreshSubscriptions: () => Promise<void>;
}
```

---

## Accessibility Rules

- All interactive elements have `aria-label` when icon-only
- Color is never the ONLY indicator of status (always paired with text/icon)
- Focus rings use `outline: 2px solid var(--color-accent)` — visible in dark mode
- Shame score meter has `role="meter"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Cancel confirmation uses `aria-live="polite"` for the undo toast
