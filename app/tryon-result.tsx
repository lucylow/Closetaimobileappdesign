import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/lib/useTheme';

export default function TryOnResultScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { resultUri } = useLocalSearchParams<{ resultUri: string }>();

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Try-On Result</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {resultUri ? (
          <Image
            source={{ uri: resultUri }}
            style={styles.resultImage}
            contentFit="contain"
            transition={400}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="image-outline" size={56} color={colors.tabIconDefault} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No result available</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 18 },
  content: { flex: 1, padding: 20 },
  resultImage: { flex: 1, borderRadius: 16 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontFamily: 'Outfit_500Medium', fontSize: 16 },
});
