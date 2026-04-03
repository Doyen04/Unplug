export const getShameLabel = (score: number): string => {
  if (score >= 80) return 'You should feel bad about this.';
  if (score >= 60) return 'Room for improvement. Significant room.';
  if (score >= 40) return 'Mediocre. But fixable.';
  if (score >= 20) return 'Not bad. Keep going.';
  return 'Respectable. For now.';
};

export const getScoreColorClass = (score: number): string => {
  if (score >= 80) return 'text-red-500';
  if (score >= 60) return 'text-red-400';
  if (score >= 40) return 'text-amber-400';
  if (score >= 20) return 'text-lime-300';
  return 'text-acid-green';
};
