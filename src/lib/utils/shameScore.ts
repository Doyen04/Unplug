export const getShameLabel = (score: number): string => {
  if (score >= 80) return "Ouch. Let's fix this.";
  if (score >= 60) return 'Some room to improve.';
  if (score >= 40) return 'Getting better.';
  if (score >= 20) return 'Nearly there.';
  return 'Clean slate. Nice work.';
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const lerp = (a: number, b: number, t: number): number =>
  Math.round(a + (b - a) * t);

/**
 * Interpolates score color through danger → warning → success
 * per DESIGN.md: 100 → #E53434 (danger), 50 → #E8860A (warning), 0 → #1C9E5B (success)
 */
export const interpolateScoreColor = (score: number): string => {
  const t = clamp(score, 0, 100) / 100;

  const danger  = { r: 229, g: 52,  b: 52  }; // #E53434
  const warning = { r: 232, g: 134, b: 10  }; // #E8860A
  const success = { r: 28,  g: 158, b: 91  }; // #1C9E5B

  if (t >= 0.5) {
    // 50–100: warning → danger
    const localT = (t - 0.5) / 0.5;
    return `rgb(${lerp(warning.r, danger.r, localT)}, ${lerp(warning.g, danger.g, localT)}, ${lerp(warning.b, danger.b, localT)})`;
  }

  // 0–50: success → warning
  const localT = t / 0.5;
  return `rgb(${lerp(success.r, warning.r, localT)}, ${lerp(success.g, warning.g, localT)}, ${lerp(success.b, warning.b, localT)})`;
};

export const getScoreColor = (score: number): string => {
  if (score >= 70) return '#E53434'; // danger
  if (score >= 40) return '#E8860A'; // warning
  return '#1C9E5B';                  // success
};
