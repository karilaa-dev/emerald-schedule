const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "Panels": { bg: "#d1fae5", text: "#065f46" },
  "Side Quest": { bg: "#fef3c7", text: "#92400e" },
  "Family HQ": { bg: "#e0f2fe", text: "#075985" },
  "The Tavern": { bg: "#f3e8ff", text: "#6b21a8" },
  "Workshops": { bg: "#ffedd5", text: "#9a3412" },
  "Photo Ops": { bg: "#fce7f3", text: "#9d174d" },
  "Autographing": { bg: "#fee2e2", text: "#991b1b" },
  "Comics": { bg: "#e0e7ff", text: "#3730a3" },
  "Literary": { bg: "#ccfbf1", text: "#134e4a" },
  "Meetups": { bg: "#ecfccb", text: "#3f6212" },
  "Movies/TV": { bg: "#ede9fe", text: "#5b21b6" },
  "Professional Programming": { bg: "#f1f5f9", text: "#334155" },
  "Book Signings": { bg: "#cffafe", text: "#155e75" },
  "Families": { bg: "#dbeafe", text: "#1e40af" },
  "After Dark": { bg: "#f3f4f6", text: "#374151" },
  "Pride Lounge": { bg: "#fae8ff", text: "#86198f" },
};

/** Deterministic color from string hash for unknown categories */
function hashColor(str: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return { bg: `hsl(${hue}, 40%, 92%)`, text: `hsl(${hue}, 50%, 25%)` };
}

export function getCategoryColor(name: string): { bg: string; text: string } {
  return CATEGORY_COLORS[name] ?? hashColor(name);
}
