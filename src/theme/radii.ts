// Border-radius tokens — mirrors the portal's rounded-lg / rounded-xl etc.
// Pill = 999 (fully round, use for buttons and chips).

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  pill: 999,
} as const;

export type RadiiKey = keyof typeof Radii;
