import { useColorScheme } from 'react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export function useTheme() {
  const systemScheme = useColorScheme();
  const { isDark } = useApp();
  const colors = isDark ? Colors.dark : Colors.light;
  return { colors, isDark };
}
