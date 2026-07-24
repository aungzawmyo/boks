/** Mobile / brand tokens from boks mockups */
export const colors = {
  primary: '#1A4334',
  primaryMuted: '#2A5C48',
  background: '#F9F8F3',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  accentOrange: '#C4784A',
  accentSage: '#8FA88A',
  accentBlue: '#5B7C99',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  star: '#F5A623',
} as const;

export const radii = {
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  full: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const typography = {
  fontFamily: 'System',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
} as const;
