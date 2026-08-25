import { useColorScheme } from 'react-native';
import { Colors } from '../constants/colors';
import useMovieStore from '../store/movieStore';

export function useThemeColors() {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const theme = useMovieStore((s) => s.theme); // 'light' | 'dark' | 'system'

  const resolved = theme === 'system' ? (systemScheme ?? 'dark') : theme;
  return Colors[resolved] ?? Colors.dark;
}
