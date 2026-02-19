import { ChevronRight, LogOut, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { AvatarBubble } from "../design-system/AvatarBubble";
import { GlassCard } from "../design-system/GlassCard";
import { TagChip } from "../design-system/TagChip";
import { BottomTabBar } from "../design-system/BottomTabBar";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { StatusBar } from "../design-system/StatusBar";

const stylePreferences = [
  "Minimalist", "Maximalist", "Vintage", "Modern",
  "Casual", "Formal", "Streetwear", "Bohemian"
];

export function SettingsScreen() {
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["Minimalist", "Modern", "Casual"]);
  const [darkMode, setDarkMode] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const navigate = useNavigate();

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  return (
    <div className="mobile-container relative overflow-hidden pb-32">
      <StatusBar />
      <div className="safe-area-top px-6">
        {/* Header with Profile */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <AvatarBubble name="Alex" size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Alex Chen</h1>
          <p className="text-gray-600">Wardrobe Explorer</p>
        </div>

        {/* Style Preferences Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Style Preferences</h2>
          <GlassCard>
            <p className="text-sm text-gray-600 mb-3">
              Select styles that match your vibe
            </p>
            <div className="flex flex-wrap gap-2">
              {stylePreferences.map((style) => (
                <TagChip
                  key={style}
                  label={style}
                  active={selectedStyles.includes(style)}
                  onClick={() => toggleStyle(style)}
                />
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Appearance Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Appearance</h2>
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-gray-700" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-700" />
                )}
                <div>
                  <p className="font-semibold text-gray-900">Dark Mode</p>
                  <p className="text-xs text-gray-500">Toggle dark theme</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setDarkMode(!darkMode)}
                className={`
                  w-14 h-8 rounded-full p-1 transition-colors
                  ${darkMode ? 'bg-[#6E4AE0]' : 'bg-gray-300'}
                `}
              >
                <motion.div
                  animate={{ x: darkMode ? 24 : 0 }}
                  className="w-6 h-6 rounded-full bg-white"
                />
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center text-gray-700">
                  ✨
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Demo Mode</p>
                  <p className="text-xs text-gray-500">Show sample data</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setDemoMode(!demoMode)}
                className={`
                  w-14 h-8 rounded-full p-1 transition-colors
                  ${demoMode ? 'bg-[#00C9B7]' : 'bg-gray-300'}
                `}
              >
                <motion.div
                  animate={{ x: demoMode ? 24 : 0 }}
                  className="w-6 h-6 rounded-full bg-white"
                />
              </motion.button>
            </div>
          </GlassCard>
        </div>

        {/* Settings List */}
        <div className="space-y-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <GlassCard hoverable className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">Notifications</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </GlassCard>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <GlassCard hoverable className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">Privacy</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </GlassCard>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <GlassCard hoverable className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">Help & Support</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </GlassCard>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <GlassCard hoverable className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">About ClosetAI</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </GlassCard>
          </motion.button>
        </div>

        {/* Sign Out */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/")}
          className="w-full py-4 rounded-full border-2 border-red-300 text-red-600 font-semibold flex items-center justify-center gap-2 glass-card-subtle"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </motion.button>
      </div>

      <BottomTabBar />
    </div>
  );
}