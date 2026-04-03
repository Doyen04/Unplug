import type { UsageConfidence, UsageVerdict } from '../../types/subscription';

export interface UsageSignalInput {
  transactionGap: number;
  emailSignal: number;
  appInstalled: number;
  userCheckin: number;
  secondaryActivity: number;
}

export interface UsageSignalResult {
  score: number;
  confidence: UsageConfidence;
  verdict: UsageVerdict;
}

export const calculateUsageScore = (
  signals: UsageSignalInput
): UsageSignalResult => {
  const score = Math.round(
    signals.transactionGap * 0.3 +
    signals.emailSignal * 0.25 +
    signals.appInstalled * 0.2 +
    signals.userCheckin * 0.2 +
    signals.secondaryActivity * 0.05
  );

  const verdict: UsageVerdict =
    score >= 70 ? 'active' : score >= 45 ? 'likely_unused' : 'unused';

  const confidence: UsageConfidence =
    score >= 75 || score <= 20 ? 'high' : score >= 40 ? 'medium' : 'low';

  return { score, confidence, verdict };
};
