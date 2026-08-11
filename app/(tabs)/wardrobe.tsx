import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
  Platform,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/lib/useTheme';
import { CATEGORIES } from '@/lib/demo-data';
import { shadows } from '@/constants/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_GAP = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - 40 - ITEM_GAP) / 2;

function WardrobeGridItem({ item, colors, isDark, onRemove, index }: { item: any; colors: any; isDark: boolean; onRemove: (id: string) => void; index: number }) {
  return (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(350)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push({ pathname: '/item-detail', params: { id: item.id } });
        }}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Alert.alert('Remove Item', `Remove "${item.name}" from your wardrobe?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => onRemove(item.id) },
          ]);
        }}
        style={({ pressed }) => [
          styles.gridItem,
          { backgroundColor: colors.surface, transform: [{ scale: pressed ? 0.97 : 1 }] },
          shadows.medium,
        ]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.gridImage}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)']}
            style={styles.imageOverlay}
          >
            {item.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </Text>
              </View>
            )}
          </LinearGradient>
          {(item.usageCount || 0) > 0 && (
            <View style={styles.usageBadge}>
              <Ionicons name="repeat-outline" size={10} color="#FFF" />
              <Text style={styles.usageBadgeText}>{item.usageCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.gridItemInfo}>
          <Text style={[styles.gridItemName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.gridItemMetaRow}>
            {item.color && (
              <View style={[styles.colorDot, { backgroundColor: getColorHex(item.color) }]} />
            )}
            <Text style={[styles.gridItemMeta, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.brand ? item.brand : ''}{item.brand && item.color ? ' \u00B7 ' : ''}{item.color || ''}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function getColorHex(color: string): string {
  const map: Record<string, string> = {
    black: '#1A1A1A', white: '#F5F0EB', red: '#E74C3C', blue: '#3498DB',
    green: '#27AE60', navy: '#2C3E50', beige: '#D4A574', gray: '#9B9590',
    grey: '#9B9590', pink: '#EC4899', brown: '#8B7355', yellow: '#F5C842',
    orange: '#F39C12', purple: '#6E4AE0', cream: '#FAF7F2',
  };
  return map[color.toLowerCase()] || '#9B9590';
}

export default function WardrobeScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { wardrobeItems, removeWardrobeItem, refreshWardrobe } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshWardrobe();
    } finally {
      setRefreshing(false);
    }
  }, [refreshWardrobe]);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return wardrobeItems;
    return wardrobeItems.filter(i => i.category === selectedCategory);
  }, [wardrobeItems, selectedCategory]);

  const handleRemove = useCallback((id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    removeWardrobeItem(id);
  }, [removeWardrobeItem]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#1A1612', '#0D0D0D'] : ['#F0E6DB', '#FAF7F2']}
        style={[styles.headerGradient, { paddingTop: (insets.top || webTopInset) + 12 }]}
      >
        <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>My Wardrobe</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {wardrobeItems.length} item{wardrobeItems.length !== 1 ? 's' : ''} cataloged
            </Text>
          </View>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/add-item');
            }}
            style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.92 : 1 }] }]}
          >
            <LinearGradient
              colors={['#C17F59', '#D4A574']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addBtn}
            >
              <Ionicons name="add" size={22} color="#FFF" />
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {wardrobeItems.length > 0 && (
          <Animated.View entering={FadeIn.delay(200).duration(300)} style={styles.summaryRow}>
            {Object.entries(
              wardrobeItems.reduce((acc: Record<string, number>, item) => {
                acc[item.category] = (acc[item.category] || 0) + 1;
                return acc;
              }, {}),
            ).slice(0, 4).map(([cat, count]) => (
              <View key={cat} style={[styles.summaryPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                <Text style={[styles.summaryCount, { color: colors.tint }]}>{count}</Text>
                <Text style={[styles.summaryCat, { color: colors.textSecondary }]}>{cat}</Text>
              </View>
            ))}
          </Animated.View>
        )}
      </LinearGradient>

      <View style={styles.filtersRow}>
        <Pressable
          onPress={() => setSelectedCategory(null)}
          style={({ pressed }) => [
            styles.filterChip,
            {
              backgroundColor: !selectedCategory ? colors.tint : isDark ? 'rgba(255,255,255,0.06)' : colors.surfaceSecondary,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
        >
          <Text style={[styles.filterText, { color: !selectedCategory ? '#FFF' : colors.textSecondary }]}>
            All ({wardrobeItems.length})
          </Text>
        </Pressable>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          renderItem={({ item }) => {
            const count = wardrobeItems.filter(w => w.category === item).length;
            const selected = selectedCategory === item;
            return (
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedCategory(selected ? null : item);
                }}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: selected ? colors.tint : isDark ? 'rgba(255,255,255,0.06)' : colors.surfaceSecondary,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                ]}
              >
                <Text style={[styles.filterText, { color: selected ? '#FFF' : colors.textSecondary }]}>
                  {item.charAt(0).toUpperCase() + item.slice(1)} ({count})
                </Text>
              </Pressable>
            );
          }}
          contentContainerStyle={{ gap: 8 }}
        />
      </View>

      {filteredItems.length === 0 ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.emptyState}>
          <LinearGradient
            colors={isDark ? ['rgba(193,127,89,0.1)', 'rgba(193,127,89,0.02)'] : ['rgba(193,127,89,0.08)', 'rgba(193,127,89,0.01)']}
            style={styles.emptyIconWrap}
          >
            <Ionicons name="shirt-outline" size={40} color={colors.tint} />
          </LinearGradient>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No items yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Snap photos of your clothes to build your digital closet
          </Text>
          <Pressable
            onPress={() => router.push('/add-item')}
            style={({ pressed }) => [
              styles.emptyButton,
              { transform: [{ scale: pressed ? 0.96 : 1 }] },
            ]}
          >
            <LinearGradient
              colors={['#C17F59', '#D4A574']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.emptyButtonGradient}
            >
              <Ionicons name="camera-outline" size={18} color="#FFF" />
              <Text style={styles.emptyButtonText}>Add Your First Item</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      ) : (
        <FlatList
          data={filteredItems}
          numColumns={2}
          keyExtractor={item => item.id}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.tint}
              colors={[colors.tint]}
            />
          }
          renderItem={({ item, index }) => (
            <WardrobeGridItem item={item} colors={colors} isDark={isDark} onRemove={handleRemove} index={index} />
          )}
          ListFooterComponent={<View style={{ height: 120 }} />}
        />
      )}

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/add-item');
        }}
        style={({ pressed }) => [
          styles.fab,
          { bottom: (insets.bottom || (Platform.OS === 'web' ? 34 : 0)) + 90, transform: [{ scale: pressed ? 0.92 : 1 }] },
        ]}
      >
        <LinearGradient
          colors={['#C17F59', '#D4A574']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 26 },
  subtitle: { fontFamily: 'Outfit_400Regular', fontSize: 13, marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    flexWrap: 'wrap',
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  summaryCount: { fontFamily: 'Outfit_700Bold', fontSize: 13 },
  summaryCat: { fontFamily: 'Outfit_400Regular', fontSize: 11, textTransform: 'capitalize' },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: { fontFamily: 'Outfit_500Medium', fontSize: 13 },
  row: { gap: ITEM_GAP, paddingHorizontal: 20 },
  gridContent: { gap: ITEM_GAP },
  gridItem: {
    width: ITEM_WIDTH,
    borderRadius: 18,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  gridImage: { width: '100%', height: ITEM_WIDTH * 1.2 },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 10,
    color: '#FFF',
  },
  usageBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  usageBadgeText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 10,
    color: '#FFF',
  },
  gridItemInfo: { padding: 10, gap: 3 },
  gridItemName: { fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
  gridItemMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  colorDot: { width: 8, height: 8, borderRadius: 4 },
  gridItemMeta: { fontFamily: 'Outfit_400Regular', fontSize: 12 },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontFamily: 'Outfit_700Bold', fontSize: 22 },
  emptySubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  emptyButton: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#C17F59',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  emptyButtonText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: '#FFF' },
  fab: {
    position: 'absolute',
    right: 20,
    borderRadius: 28,
    shadowColor: '#C17F59',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
