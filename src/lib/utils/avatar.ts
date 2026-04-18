const avatarStyleByInitial: Record<string, string> = {
  A: 'bg-[#F5E6C8] text-[#7A4E12]',
  C: 'bg-[#D4E8D0] text-[#2F5A2D]',
  U: 'bg-[#F5D5C8] text-[#8A3E2B]',
  N: 'bg-[#E8E4DC] text-[#3B3934]',
};

export const fallbackAvatarStyle = 'bg-[#E8E4DC] text-[#3B3934]';

export const getAvatarClass = (name: string): string => {
  const initial = name.trim().charAt(0).toUpperCase();
  return avatarStyleByInitial[initial] ?? fallbackAvatarStyle;
};
