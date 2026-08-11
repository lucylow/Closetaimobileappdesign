import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/lib/useTheme';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Ionicons name="compass-outline" size={56} color={colors.tabIconDefault} />
      <Text style={[styles.title, { color: colors.text }]}>Page Not Found</Text>
      <Pressable
        onPress={() => router.replace('/(tabs)')}
        style={[styles.button, { backgroundColor: colors.tint }]}
      >
        <Text style={styles.buttonText}>Go Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  title: { fontFamily: 'Outfit_600SemiBold', fontSize: 20 },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  buttonText: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: '#FFF' },
});
