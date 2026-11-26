export const palette = {
  primary: '#A71930',
  primaryDark: '#751B32',
  primarySoft: '#F3E3E6',
  background: '#F8F6F3',
  surface: '#FFFFFF',
  text: '#202124',
  textMuted: '#747474',
  border: '#E5DED8',
  borderStrong: '#D2C7BF',
  success: '#5F8F6B',
  successSoft: '#EAF3EC',
  warning: '#B7791F',
  warningSoft: '#FFF6E5',
  danger: '#B3261E',
  dangerSoft: '#FDECEC',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(32, 33, 36, 0.45)',
} as const;

export const colors = {
  light: {
    text: palette.text,
    textMuted: palette.textMuted,
    background: palette.background,
    surface: palette.surface,
    card: palette.surface,
    border: palette.border,
    borderStrong: palette.borderStrong,
    tint: palette.primary,
    icon: palette.textMuted,
    tabIconDefault: 'rgba(255,255,255,0.72)',
    tabIconSelected: palette.white,
    primary: palette.primary,
    primaryDark: palette.primaryDark,
    primarySoft: palette.primarySoft,
    success: palette.success,
    successSoft: palette.successSoft,
    warning: palette.warning,
    warningSoft: palette.warningSoft,
    danger: palette.danger,
    dangerSoft: palette.dangerSoft,
    inputBackground: palette.surface,
    placeholder: '#8A8581',
    notification: palette.primary,
    shadow: '#1A1412',
  },
  dark: {
    text: '#F3F1EE',
    textMuted: '#C2BBB5',
    background: '#171312',
    surface: '#221C1A',
    card: '#221C1A',
    border: '#3A312E',
    borderStrong: '#554845',
    tint: '#D55B70',
    icon: '#C2BBB5',
    tabIconDefault: 'rgba(255,255,255,0.72)',
    tabIconSelected: '#FFFFFF',
    primary: '#D24A60',
    primaryDark: '#F0C2CB',
    primarySoft: '#3A2328',
    success: '#8FBE99',
    successSoft: '#243129',
    warning: '#E3B35E',
    warningSoft: '#332A1A',
    danger: '#F28B82',
    dangerSoft: '#3A2323',
    inputBackground: '#221C1A',
    placeholder: '#9C9490',
    notification: '#D24A60',
    shadow: '#000000',
  },
} as const;

export type ThemeMode = keyof typeof colors;
export type ThemeColors = typeof colors.light;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodySm: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  button: { fontSize: 16, lineHeight: 20, fontWeight: '600' as const },
} as const;

export const shadows = {
  card: {
    shadowColor: '#1A1412',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  soft: {
    shadowColor: '#1A1412',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
} as const;
