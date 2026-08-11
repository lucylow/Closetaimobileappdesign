import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/lib/useTheme';
import { shadows } from '@/constants/colors';

export default function OutfitDetailScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { outfits, savedOutfits, rateOutfit, saveOutfit, unsaveOutfit, getExplanation, trackAffiliate, subscriptionTier } = useApp();
  const [showExplanation, setShowExplanation] = useState(false);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const outfit = outfits.find(o => o.id === id) || savedOutfits.find(o => o.id === id);

  if (!outfit) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.tabIconDefault} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Outfit not found</Text>
        </View>
      </View>
    );
  }

  const explanation = getExplanation(outfit.id);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Outfit Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: (insets.bottom || webBottomInset) + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(400)}>
          <Text style={[styles.outfitName, { color: colors.text }]}>{outfit.name}</Text>
          {outfit.occasion && (
            <View style={[styles.occasionPill, { backgroundColor: colors.tint + '12' }]}>
              <Ionicons name="flag-outline" size={12} color={colors.tint} />
              <Text style={[styles.outfitOccasion, { color: colors.tint }]}>{outfit.occasion}</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.itemsGrid}>
          {outfit.items.map((item, idx) => (
            <View key={item.id + idx} style={[styles.itemCard, { backgroundColor: colors.surface }, shadows.soft]}>
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} contentFit="cover" transition={300} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.25)']}
                style={styles.itemImageOverlay}
              />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                {item.brand ? (
                  <Text style={[styles.itemBrand, { color: colors.textSecondary }]} numberOfLines={1}>{item.brand}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <Text style={[styles.reasonText, { color: colors.text }]}>{outfit.reason}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(250).duration(400)} style={styles.tagsRow}>
          {outfit.tags.map(tag => (
            <View key={tag} style={[styles.tag, { backgroundColor: colors.tint + '10' }]}>
              <Text style={[styles.tagText, { color: colors.tint }]}>{tag}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.actionsRow}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              rateOutfit(outfit.id, outfit.rating === 'like' ? 'neutral' : 'like');
            }}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: outfit.rating === 'like' ? '#E74C3C12' : colors.surfaceSecondary, transform: [{ scale: pressed ? 0.92 : 1 }] },
            ]}
          >
            <Ionicons name={outfit.rating === 'like' ? 'heart' : 'heart-outline'} size={22} color={outfit.rating === 'like' ? '#E74C3C' : colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              rateOutfit(outfit.id, outfit.rating === 'dislike' ? 'neutral' : 'dislike');
            }}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: outfit.rating === 'dislike' ? '#F39C1212' : colors.surfaceSecondary, transform: [{ scale: pressed ? 0.92 : 1 }] },
            ]}
          >
            <Ionicons name={outfit.rating === 'dislike' ? 'thumbs-down' : 'thumbs-down-outline'} size={22} color={outfit.rating === 'dislike' ? '#F39C12' : colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              outfit.saved ? unsaveOutfit(outfit.id) : saveOutfit(outfit.id);
            }}
            style={({ pressed }) => [
              styles.saveButton,
              { transform: [{ scale: pressed ? 0.96 : 1 }] },
            ]}
          >
            {outfit.saved ? (
              <LinearGradient
                colors={['#C17F59', '#D4A574']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonInner}
              >
                <Ionicons name="bookmark" size={20} color="#FFF" />
                <Text style={[styles.saveText, { color: '#FFF' }]}>Saved</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.saveButtonInner, { backgroundColor: colors.surfaceSecondary }]}>
                <Ionicons name="bookmark-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.saveText, { color: colors.textSecondary }]}>Save</Text>
              </View>
            )}
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(350).duration(400)}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowExplanation(!showExplanation);
            }}
            style={({ pressed }) => [
              styles.explainButton,
              { backgroundColor: colors.surfaceSecondary, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <View style={[styles.explainIcon, { backgroundColor: '#6E4AE015' }]}>
              <Ionicons name="bulb-outline" size={18} color="#6E4AE0" />
            </View>
            <Text style={[styles.explainText, { color: colors.text }]}>
              {showExplanation ? 'Hide Explanation' : 'Why This Outfit?'}
            </Text>
            <Ionicons name={showExplanation ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
          </Pressable>

          {showExplanation && (
            <Animated.View
              entering={FadeIn.duration(300)}
            >
              <LinearGradient
                colors={isDark ? ['rgba(110,74,224,0.08)', 'rgba(110,74,224,0.02)'] : ['rgba(110,74,224,0.05)', 'rgba(110,74,224,0.01)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.explanationBox}
              >
                <Text style={[styles.explanationText, { color: colors.text }]}>{explanation}</Text>
              </LinearGradient>
            </Animated.View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <LinearGradient
            colors={isDark ? ['rgba(0,201,183,0.08)', 'rgba(0,201,183,0.02)'] : ['rgba(0,201,183,0.05)', 'rgba(0,201,183,0.01)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.affiliateSection}
          >
            <View style={styles.affiliateHeader}>
              <View style={[styles.affiliateIcon, { backgroundColor: '#00C9B715' }]}>
                <Ionicons name="bag-handle-outline" size={16} color="#00C9B7" />
              </View>
              <Text style={[styles.affiliateTitle, { color: colors.text }]}>Shop This Look</Text>
              {subscriptionTier !== 'free' && (
                <View style={[styles.earnBadge, { backgroundColor: '#27AE6015' }]}>
                  <Ionicons name="cash-outline" size={11} color="#27AE60" />
                  <Text style={styles.earnText}>Earn</Text>
                </View>
              )}
            </View>
            {outfit.items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  trackAffiliate(item.name, `https://closetai.link/shop/${item.id}`, 'outfit_detail');
                }}
                style={({ pressed }) => [
                  styles.affiliateItem,
                  { backgroundColor: colors.surface, transform: [{ scale: pressed ? 0.98 : 1 }] },
                  shadows.soft,
                ]}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.affiliateItemImg} contentFit="cover" transition={200} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.affiliateItemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                  {item.brand ? <Text style={[styles.affiliateItemBrand, { color: colors.textSecondary }]}>{item.brand}</Text> : null}
                </View>
                <View style={[styles.shopBtn, { backgroundColor: '#00C9B715' }]}>
                  <Ionicons name="open-outline" size={14} color="#00C9B7" />
                </View>
              </Pressable>
            ))}
          </LinearGradient>
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
  scrollContent: { paddingHorizontal: 20, gap: 20 },
  outfitName: { fontFamily: 'Outfit_700Bold', fontSize: 26 },
  occasionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
  },
  outfitOccasion: { fontFamily: 'Outfit_500Medium', fontSize: 13 },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  itemImage: { width: '100%', height: 140 },
  itemImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  itemInfo: { padding: 10 },
  itemName: { fontFamily: 'Outfit_600SemiBold', fontSize: 13 },
  itemBrand: { fontFamily: 'Outfit_400Regular', fontSize: 11, marginTop: 2 },
  reasonText: { fontFamily: 'Outfit_400Regular', fontSize: 16, lineHeight: 24 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  tagText: { fontFamily: 'Outfit_500Medium', fontSize: 13 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonInner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderRadius: 16,
    height: 50,
  },
  saveText: { fontFamily: 'Outfit_600SemiBold', fontSize: 15 },
  explainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
  },
  explainIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  explainText: { fontFamily: 'Outfit_500Medium', fontSize: 15, flex: 1 },
  explanationBox: {
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
  },
  explanationText: { fontFamily: 'Outfit_400Regular', fontSize: 15, lineHeight: 22 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontFamily: 'Outfit_500Medium', fontSize: 16 },
  affiliateSection: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  affiliateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  affiliateIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  affiliateTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    flex: 1,
  },
  earnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  earnText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 11,
    color: '#27AE60',
  },
  affiliateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    padding: 10,
  },
  affiliateItemImg: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  affiliateItemName: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 14,
  },
  affiliateItemBrand: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  shopBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
