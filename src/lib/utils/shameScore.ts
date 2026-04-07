export const getShameLabel = (score: number): string => {
  if (score >= 80) return 'You should feel bad about this.';
  if (score >= 60) return 'Room for improvement. Significant room.';
  if (score >= 40) return 'Mediocre. But fixable.';
  if (score >= 20) return 'Not bad. Keep going.';
  return 'Respectable. For now.';
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const interpolateScoreColor = (score: number): string => {
  const t = clamp(score, 0, 100) / 100;

  // 0 -> acid green (#C8F135), 100 -> danger red (#FF4444)
  const start = { r: 200, g: 241, b: 53 };
  const end = { r: 255, g: 68, b: 68 };

  const r = Math.round(start.r + (end.r - start.r) * t);
  const g = Math.round(start.g + (end.g - start.g) * t);
  const b = Math.round(start.b + (end.b - start.b) * t);

  return `rgb(${r}, ${g}, ${b})`;
};

export const getScoreColorClass = (score: number): string => {
  if (score >= 80) return 'text-red-500';
  if (score >= 60) return 'text-red-400';
  if (score >= 40) return 'text-amber-400';
  if (score >= 20) return 'text-lime-300';
  return 'text-acid-green';
};
