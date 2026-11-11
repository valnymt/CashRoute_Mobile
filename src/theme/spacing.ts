// Spacing tokens — the portal controls padding/margin via Tailwind's
// 4-pixel scale; this mirrors that so screens can write
//   padding: Spacing.lg   // instead of   padding: 16
// and we get a single source of truth for layout rhythm.

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export type SpacingKey = keyof typeof Spacing;
