# Usage Signals — Detection Logic

This document defines how Unplug determines whether a
subscription is being used. No single signal is conclusive — we combine
weighted signals into a usage score (0–100).

---

## Signal Definitions

### 1. `transaction_gap` (Weight: 30)

**What it measures:** Days since the last charge vs. the expected billing cadence.

**Logic:**

```typescript
// A subscription charged monthly that hasn't been charged in 45 days
// is likely cancelled by the provider or changed cadence — flag it.

function transactionGapSignal(
  lastChargeDate: Date,
  billingCadenceDays: number  // 30 for monthly, 7 for weekly, 365 for annual
): { score: number; note: string } {
  const daysSince = differenceInDays(new Date(), lastChargeDate);
  const ratio = daysSince / billingCadenceDays;

  if (ratio < 1.1) return { score: 80, note: 'Charging on expected cadence' };
  if (ratio < 1.5) return { score: 60, note: 'Slightly overdue — may have churned' };
  if (ratio < 2.0) return { score: 30, note: 'Significantly overdue' };
  return { score: 10, note: 'No recent charge — possibly already cancelled' };
}
```

**Confidence:** High — billing data is factual.

---

### 2. `email_signal` (Weight: 25)

**What it measures:** Presence of re-engagement or "we miss you" emails
from the subscription provider in the connected email account.

**How it works:**

- Scan Gmail/IMAP for emails from known subscription domains
- Match subject lines against re-engagement patterns:
  - "We miss you"
  - "Come back"
  - "Your account has been inactive"
  - "Don't lose your streak"
  - "Your subscription is still active" (paradoxically sent to inactive users)

```typescript
const REENGAGEMENT_PATTERNS = [
  /we miss you/i,
  /come back/i,
  /inactive/i,
  /don.t lose/i,
  /been a while/i,
  /still active/i,
  /haven.t seen you/i,
];

function emailSignal(emails: { subject: string; from: string }[]): {
  score: number;
  detected: boolean;
  note: string;
} {
  const hit = emails.some(e =>
    REENGAGEMENT_PATTERNS.some(p => p.test(e.subject))
  );
  return hit
    ? { score: 15, detected: true, note: 'Re-engagement email detected from provider' }
    : { score: 85, detected: false, note: 'No re-engagement emails found' };
}
```

**Confidence:** Medium — not all providers send these.

---

### 3. `app_installed` (Weight: 20)

**What it measures:** Whether the app associated with the subscription
is currently installed on the user's device.

**Implementation:**

- iOS: Check App Store purchase history (requires user permission)
- Android: Check installed packages (requires permission)
- Desktop: Not applicable

**Logic:**

```typescript
function appInstalledSignal(
  isInstalled: boolean | null  // null = unknown/not permitted
): { score: number; confidence: 'high' | 'low' } {
  if (isInstalled === null) return { score: 50, confidence: 'low' };
  return isInstalled
    ? { score: 70, confidence: 'high' }   // installed ≠ using, but positive signal
    : { score: 10, confidence: 'high' };  // not installed is strong unused signal
}
```

**Confidence:** High when available, unavailable for web-only services.

---

### 4. `user_checkin` (Weight: 20)

**What it measures:** Self-reported usage from the monthly check-in prompt.

**Prompt shown to user:** "Did you use [Service] this month? Yes / No / Skip"

**Logic:**

```typescript
function userCheckinSignal(history: Array<'yes' | 'no' | 'skip'>): {
  score: number;
  note: string;
} {
  const recent = history.slice(-3);  // last 3 months
  if (recent.length === 0) return { score: 50, note: 'No check-in data' };

  const yesCount = recent.filter(r => r === 'yes').length;
  const noCount = recent.filter(r => r === 'no').length;

  if (noCount >= 2) return { score: 5, note: `Said "no" ${noCount} of last ${recent.length} months` };
  if (yesCount >= 2) return { score: 90, note: 'Recently confirmed using it' };
  return { score: 40, note: 'Mixed check-in responses' };
}
```

**Confidence:** High — user knows best. But compliance is inconsistent.

---

### 5. `secondary_activity` (Weight: 5)

**What it measures:** Presence of related transactions that imply active use
(e.g., in-app purchases, upgrades, or related charges from the same provider).

**Logic:**

```typescript
function secondaryActivitySignal(relatedTransactions: Transaction[]): {
  score: number;
  note: string;
} {
  const recentRelated = relatedTransactions.filter(
    t => differenceInDays(new Date(), t.date) < 90
  );
  return recentRelated.length > 0
    ? { score: 85, note: `${recentRelated.length} related transactions in last 90 days` }
    : { score: 50, note: 'No secondary activity detected' };
}
```

**Confidence:** Low — many active users make no secondary purchases.

---

## Combined Score Calculation

```typescript
interface UsageSignalResult {
  score: number;       // 0–100, higher = more likely being used
  confidence: 'high' | 'medium' | 'low';
  signals: Record<string, { score: number; note: string }>;
  verdict: 'active' | 'likely_unused' | 'unused' | 'unknown';
  annualWasteEstimate: number;  // dollars
}

function calculateUsageScore(
  signals: {
    transactionGap: number;
    emailSignal: number;
    appInstalled: number;
    userCheckin: number;
    secondaryActivity: number;
  },
  monthlyAmount: number
): UsageSignalResult {
  const weights = {
    transactionGap:     0.30,
    emailSignal:        0.25,
    appInstalled:       0.20,
    userCheckin:        0.20,
    secondaryActivity:  0.05,
  };

  const score = Math.round(
    Object.entries(weights).reduce(
      (sum, [key, weight]) => sum + (signals[key as keyof typeof weights] * weight),
      0
    )
  );

  const verdict =
    score >= 70 ? 'active' :
    score >= 45 ? 'likely_unused' :
    score >= 20 ? 'unused' :
    'unknown';

  const annualWasteEstimate =
    verdict === 'active' ? 0 :
    verdict === 'likely_unused' ? monthlyAmount * 12 * 0.5 :
    monthlyAmount * 12;

  return {
    score,
    confidence: 'medium',  // AI API enriches this further
    signals: {},            // populated from individual signal results
    verdict,
    annualWasteEstimate,
  };
}
```

---

## Display Rules

- Score 70–100: Show as "Active" with a green indicator. No alert.
- Score 45–69: Show as "Possibly unused" with a yellow indicator.
- Score 0–44:  Show as "Likely unused" with red left border and alert badge.
- Always show confidence level alongside the score.
- Never claim certainty — use language like "likely", "possibly", "signals suggest".

---

## Privacy Rules

- Never send raw email content to AI API — only subject line and sender domain
- App-installed check requires explicit user permission — respect denials
- User check-in answers are stored locally first, synced with consent
- Usage scores are never shared or sold — they exist only to help the user
