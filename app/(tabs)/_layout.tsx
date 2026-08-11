import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, Text } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useTheme";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="wardrobe">
        <Icon sf={{ default: "tshirt", selected: "tshirt.fill" }} md="checkroom" />
        <Label>Wardrobe</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="outfits">
        <Icon sf={{ default: "sparkles", selected: "sparkles" }} md="auto-awesome" />
        <Label>Outfits</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="tryon">
        <Icon sf={{ default: "person.crop.rectangle", selected: "person.crop.rectangle.fill" }} md="person" />
        <Label>Try-On</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="content">
        <Icon sf={{ default: "square.and.arrow.up", selected: "square.and.arrow.up.fill" }} md="share" />
        <Label>Studio</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={tabStyles.iconWrap}>
      <Ionicons name={name as any} size={22} color={color} />
      {focused && <View style={[tabStyles.activeDot, { backgroundColor: colors.tint }]} />}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});

function ClassicTabLayout() {
  const { colors, isDark } = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarLabelStyle: {
          fontFamily: 'Outfit_500Medium',
          fontSize: 10,
          marginTop: -2,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : isDark ? '#0D0D0D' : '#FAF7F2',
          borderTopWidth: 0,
          elevation: 0,
          ...(isWeb ? {
            height: 84,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: isDark ? '#0D0D0D' : '#FAF7F2',
          } : {}),
          ...(!isWeb && !isIOS ? {
            borderTopWidth: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
          } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={80}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? '#0D0D0D' : '#FAF7F2' }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "home" : "home-outline"} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: "Wardrobe",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "shirt" : "shirt-outline"} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="outfits"
        options={{
          title: "Outfits",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "sparkles" : "sparkles-outline"} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tryon"
        options={{
          title: "Try-On",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "person" : "person-outline"} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="content"
        options={{
          title: "Studio",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "share-social" : "share-social-outline"} focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
