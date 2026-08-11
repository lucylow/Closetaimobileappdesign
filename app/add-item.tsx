import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/lib/useTheme';
import { CATEGORIES, COLORS } from '@/lib/demo-data';
import { shadows } from '@/constants/colors';

export default function AddItemScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { addWardrobeItem } = useApp();

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('top');
  const [color, setColor] = useState<string>('Black');
  const [brand, setBrand] = useState('');
  const [notes, setNotes] = useState('');

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addWardrobeItem({
      name: name.trim(),
      category: category as any,
      color,
      brand: brand.trim(),
      imageUrl: imageUri || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400',
      tags: [],
      notes: notes.trim(),
    });
    router.back();
  };

  const canSave = name.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Item</Text>
        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          hitSlop={12}
          style={({ pressed }) => [{ transform: [{ scale: pressed && canSave ? 0.9 : 1 }] }]}
        >
          <View style={[styles.saveIcon, { backgroundColor: canSave ? '#C17F59' : colors.tabIconDefault + '40' }]}>
            <Ionicons name="checkmark" size={20} color="#FFF" />
          </View>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: (insets.bottom || webBottomInset) + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.duration(400)}>
          <Pressable
            onPress={pickImage}
            style={({ pressed }) => [
              styles.imageBox,
              {
                backgroundColor: colors.surface,
                borderColor: imageUri ? '#C17F59' : colors.border,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
              shadows.soft,
            ]}
          >
            {imageUri ? (
              <View>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.3)']}
                  style={styles.imageOverlay}
                >
                  <View style={styles.changePhotoBtn}>
                    <Ionicons name="camera-outline" size={14} color="#FFF" />
                    <Text style={styles.changePhotoText}>Change</Text>
                  </View>
                </LinearGradient>
              </View>
            ) : (
              <View style={styles.imageEmpty}>
                <LinearGradient
                  colors={['#C17F5920', '#C17F5908']}
                  style={styles.cameraIconWrap}
                >
                  <Ionicons name="camera-outline" size={36} color="#C17F59" />
                </LinearGradient>
                <Text style={[styles.imageEmptyText, { color: colors.textSecondary }]}>Tap to add photo</Text>
              </View>
            )}
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g., Classic White Tee"
            placeholderTextColor={colors.tabIconDefault}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150).duration(400)}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map(cat => {
              const selected = category === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCategory(cat);
                  }}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.tint : colors.surfaceSecondary,
                      borderColor: selected ? colors.tint : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: selected ? '#FFF' : colors.textSecondary }]}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.colorRow}>
              {COLORS.map(c => {
                const selected = color === c.name;
                return (
                  <Pressable
                    key={c.name}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setColor(c.name);
                    }}
                    style={styles.colorItem}
                  >
                    <View
                      style={[
                        styles.colorSwatch,
                        {
                          backgroundColor: c.hex,
                          borderWidth: selected ? 3 : 1,
                          borderColor: selected ? colors.tint : colors.border,
                        },
                      ]}
                    />
                    <Text style={[styles.colorName, { color: selected ? colors.tint : colors.textSecondary }]}>
                      {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(250).duration(400)}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Brand</Text>
          <TextInput
            value={brand}
            onChangeText={setBrand}
            placeholder="e.g., Everlane"
            placeholderTextColor={colors.tabIconDefault}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional notes..."
            placeholderTextColor={colors.tabIconDefault}
            multiline
            numberOfLines={3}
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
            ]}
          />
        </Animated.View>
      </ScrollView>
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
  saveIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { paddingHorizontal: 20, gap: 20 },
  imageBox: {
    height: 220,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imagePreview: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: 12,
    paddingBottom: 10,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  changePhotoText: { fontFamily: 'Outfit_500Medium', fontSize: 12, color: '#FFF' },
  imageEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  cameraIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageEmptyText: { fontFamily: 'Outfit_400Regular', fontSize: 14 },
  label: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontFamily: 'Outfit_500Medium', fontSize: 13 },
  colorRow: { flexDirection: 'row', gap: 14, paddingRight: 20 },
  colorItem: { alignItems: 'center', gap: 4 },
  colorSwatch: { width: 36, height: 36, borderRadius: 18 },
  colorName: { fontFamily: 'Outfit_400Regular', fontSize: 10 },
});
