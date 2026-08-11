import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/lib/useTheme';
import { shadows } from '@/constants/colors';

export default function ItemDetailScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { wardrobeItems, removeWardrobeItem, markItemWorn, updateWardrobeItem } = useApp();

  const item = wardrobeItems.find(w => w.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item?.name || '');
  const [editBrand, setEditBrand] = useState(item?.brand || '');
  const [editNotes, setEditNotes] = useState(item?.notes || '');

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.topBar, { paddingTop: (insets.top || webTopInset) + 8 }]}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Item not found</Text>
        </View>
      </View>
    );
  }

  const handleMarkWorn = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await markItemWorn(item.id);
  }, [markItemWorn, item.id]);

  const handleDelete = useCallback(() => {
    Alert.alert('Remove Item', `Remove "${item.name}" from your wardrobe?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          removeWardrobeItem(item.id);
          router.back();
        },
      },
    ]);
  }, [removeWardrobeItem, item]);

  const handleSaveEdit = useCallback(async () => {
    await updateWardrobeItem(item.id, {
      name: editName.trim() || item.name,
      brand: editBrand.trim(),
      notes: editNotes.trim(),
    });
    setIsEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [updateWardrobeItem, item.id, editName, editBrand, editNotes, item.name]);

  const lastWornText = item.lastWorn
    ? new Date(item.lastWorn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Never';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: (insets.top || webTopInset) + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.topBarRight}>
          <Pressable
            onPress={() => {
              if (isEditing) {
                handleSaveEdit();
              } else {
                setIsEditing(true);
                setEditName(item.name);
                setEditBrand(item.brand || '');
                setEditNotes(item.notes || '');
              }
            }}
            hitSlop={12}
          >
            <Ionicons name={isEditing ? 'checkmark' : 'create-outline'} size={22} color={colors.tint} />
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={12}>
            <Ionicons name="trash-outline" size={22} color="#E74C3C" />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(400)}>
          <View style={[styles.imageCard, shadows.medium]}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.mainImage}
              contentFit="cover"
              transition={300}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.5)']}
              style={styles.imageGradient}
            >
              {item.category && (
                <View style={styles.categoryChip}>
                  <Text style={styles.categoryChipText}>
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.detailSection}>
          {isEditing ? (
            <View style={styles.editForm}>
              <Text style={[styles.editLabel, { color: colors.textSecondary }]}>Name</Text>
              <TextInput
                style={[styles.editInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Item name"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={[styles.editLabel, { color: colors.textSecondary }]}>Brand</Text>
              <TextInput
                style={[styles.editInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={editBrand}
                onChangeText={setEditBrand}
                placeholder="Brand"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={[styles.editLabel, { color: colors.textSecondary }]}>Notes</Text>
              <TextInput
                style={[styles.editInput, styles.editTextArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={editNotes}
                onChangeText={setEditNotes}
                placeholder="Notes"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>
          ) : (
            <>
              <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
              <View style={styles.metaRow}>
                {item.brand ? (
                  <View style={[styles.metaBadge, { backgroundColor: colors.surfaceSecondary }]}>
                    <Text style={[styles.metaBadgeText, { color: colors.textSecondary }]}>{item.brand}</Text>
                  </View>
                ) : null}
                {item.color ? (
                  <View style={[styles.metaBadge, { backgroundColor: colors.surfaceSecondary }]}>
                    <View style={[styles.colorDot, { backgroundColor: item.color.toLowerCase() === 'white' ? '#F0F0F0' : item.color.toLowerCase() }]} />
                    <Text style={[styles.metaBadgeText, { color: colors.textSecondary }]}>{item.color}</Text>
                  </View>
                ) : null}
              </View>
              {item.notes ? (
                <Text style={[styles.notes, { color: colors.textSecondary }]}>{item.notes}</Text>
              ) : null}
            </>
          )}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <View style={[styles.statsCard, { backgroundColor: colors.surface }, shadows.soft]}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#00C9B712' }]}>
                  <MaterialCommunityIcons name="hanger" size={18} color="#00C9B7" />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{item.usageCount || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Times Worn</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#6E4AE012' }]}>
                  <Ionicons name="calendar-outline" size={18} color="#6E4AE0" />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{lastWornText}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Last Worn</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {(item.tags && item.tags.length > 0) && (
          <Animated.View entering={FadeInUp.delay(300).duration(400)}>
            <View style={[styles.tagsCard, { backgroundColor: colors.surface }, shadows.soft]}>
              <View style={styles.tagsHeader}>
                <MaterialCommunityIcons name="tag-multiple-outline" size={16} color={colors.tint} />
                <Text style={[styles.tagsTitle, { color: colors.text }]}>Tags</Text>
              </View>
              <View style={styles.tagsWrap}>
                {item.tags.map((tag: string) => (
                  <View key={tag} style={[styles.tagChip, { backgroundColor: colors.tint + '12' }]}>
                    <Text style={[styles.tagText, { color: colors.tint }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(350).duration(400)}>
          <Pressable
            onPress={handleMarkWorn}
            style={({ pressed }) => [
              styles.wornButton,
              { transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <LinearGradient
              colors={['#00C9B7', '#00E5D0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.wornButtonGradient}
            >
              <MaterialCommunityIcons name="check-circle-outline" size={20} color="#FFF" />
              <Text style={styles.wornButtonText}>Mark as Worn Today</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: { fontFamily: 'Outfit_500Medium', fontSize: 16 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  imageCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  mainImage: {
    width: '100%',
    height: 360,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  categoryChip: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryChipText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: '#FFF',
  },
  detailSection: {
    marginBottom: 16,
  },
  itemName: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
  },
  metaBadgeText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  notes: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  editForm: {
    gap: 6,
  },
  editLabel: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
    marginTop: 4,
  },
  editInput: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  editTextArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  statsCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    textAlign: 'center',
  },
  statLabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 50,
    marginHorizontal: 8,
  },
  tagsCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  tagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  tagsTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  tagText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
  },
  wornButton: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 4,
    shadowColor: '#00C9B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  wornButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  wornButtonText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
});
