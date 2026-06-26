import { useColorScheme } from 'react-native';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: 'text' | 'background' | 'card' | 'border' | 'notification' | 'inputBackground' | 'placeholder'
) {
  const theme = useColorScheme() ?? 'light';

  const colors = {
    light: {
      text: '#000',
      background: '#fff',
      card: '#f9f9f9',
      border: '#ccc',
      notification: '#f50057',
      inputBackground: '#f0f0f0',
      placeholder: '#888',
    },
    dark: {
      text: '#fff',
      background: '#121212',
      card: '#1c1c1e',
      border: '#333',
      notification: '#ff4081',
      inputBackground: '#1c1c1c',
      placeholder: '#888',
    },
  };

  return props[theme] ?? colors[theme][colorName];
}
