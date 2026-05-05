export const colors = {
  primary: '#58CC02',
  primaryDark: '#46A302',
  secondary: '#1CB0F6',
  accent: '#FF9600',
  danger: '#FF4B4B',
  gold: '#FFC800',
  purple: '#CE82FF',
  bg: '#FFFFFF',
  bgAlt: '#F7F7F7',
  text: '#3C3C3C',
  textMuted: '#777777',
  border: '#E5E5E5',
  card: '#FFFFFF',
  shadow: '#000000',
  heart: '#FF4B4B',
  gem: '#1CB0F6',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const fonts = {
  size: { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28, display: 36 },
  weight: { regular: '400', medium: '500', bold: '700', black: '900' } as const,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.0,
    shadowRadius: 0,
    elevation: 0,
  },
};
