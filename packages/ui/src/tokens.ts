export const COLORS = {
  /** Primary brand — Hibiscus (#66001e). High-brand authority, primary actions. */
  primary: '#66001e',
  /** Primary container — deeper Hibiscus for gradient endpoints. */
  primaryContainer: '#8d0b2f',
  /** Secondary — Baobab (#4d6630). Organic accents, wellness UI. */
  secondary: '#4d6630',
  /** Secondary container — light green for success states / "Natural" callouts. */
  secondaryContainer: '#cceaa6',
  /** On secondary container — botanical motif color. */
  onSecondaryContainer: '#516a34',
  /** Tertiary — Tamarind/Gold (#735c00). Premium highlights, rewards. */
  tertiary: '#735c00',
  /** Background — Soft Cream (#fcf9f4). Editorial "paper." */
  background: '#fcf9f4',
  /** On surface — warm near-black for text. Never use #000. */
  onSurface: '#1c1c19',
  /** Outline variant — ghost border color (use at 15% opacity). */
  outlineVariant: '#dfbfc0',
} as const;

export const SURFACES = {
  /** Layer 0 — Base surface. */
  surface: '#fcf9f4',
  /** Layer 1 — Section backgrounds. */
  surfaceContainerLow: '#f6f3ee',
  /** Layer 2 — Card / bright lift. */
  surfaceContainerLowest: '#ffffff',
} as const;

export const TYPOGRAPHY = {
  fontFamilySerif: '"Noto Serif", Georgia, serif',
  fontFamilySans: '"Manrope", system-ui, sans-serif',
  displayLg: {
    fontFamily: '"Noto Serif", Georgia, serif',
    fontSize: '3.5rem',
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
  headlineLg: {
    fontFamily: '"Noto Serif", Georgia, serif',
    fontSize: '2rem',
    lineHeight: 1.3,
  },
  titleMd: {
    fontFamily: '"Manrope", system-ui, sans-serif',
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  bodyLg: {
    fontFamily: '"Manrope", system-ui, sans-serif',
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  labelMd: {
    fontFamily: '"Manrope", system-ui, sans-serif',
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  },
} as const;

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '80px',
  section: '80px',
  cardPadding: '24px',
  imageTextGap: '16px',
} as const;

export const SHADOWS = {
  /** Ambient shadow for floating elements (FABs, modals). */
  ambient: '0 12px 32px -4px rgba(88, 65, 67, 0.06)',
} as const;
