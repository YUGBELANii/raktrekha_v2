import { useColorScheme } from 'react-native';
import { colors } from '@/constants/theme';

type ColorName = keyof typeof colors.light;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorName
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];
  if (colorFromProps) return colorFromProps;
  return colors[theme][colorName];
}

export function useAppTheme() {
  const scheme = useColorScheme() ?? 'light';
  return { scheme, colors: colors[scheme], isDark: scheme === 'dark' };
}
