import { Cloud, Plus, Sparkles, Share2, Clock, TrendingDown, Coffee } from "lucide-react";
import { GlassCard } from "../design-system/GlassCard";
import { TagChip } from "../design-system/TagChip";
import { AvatarBubble } from "../design-system/AvatarBubble";
import { SectionHeader } from "../design-system/SectionHeader";
import { BottomTabBar } from "../design-system/BottomTabBar";
import { StatusBar } from "../design-system/StatusBar";
import { PrimaryButton } from "../design-system/PrimaryButton";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export function HomeScreen() {
  const navigate = useNavigate();

  const wardrobeItems = [
    { 
      id: 1, 
      image: "https://images.unsplash.com/photo-1722310752951-4d459d28c678?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      name: "White Tee"
    },
    { 
      id: 2, 
      image: "https://images.unsplash.com/photo-1602585198422-d795fa9bfd6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      name: "Denim Jeans"
    },
    { 
      id: 3, 
      image: "https://images.unsplash.com/photo-1602303894456-398ce544d90b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      name: "Summer Dress"
    },
    { 
      id: 4, 
      image: "https://images.unsplash.com/photo-1650320079970-b4ee8f0dae33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      name: "Sneakers"
    },
    { 
      id: 5, 
      image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      name: "Leather Jacket"
    },
  ];

  const todayOutfitItems = [
    "https://images.unsplash.com/photo-1722310752951-4d459d28c678?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
    "https://images.unsplash.com/photo-1602585198422-d795fa9bfd6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
    "https://images.unsplash.com/photo-1602303894456-398ce544d90b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
    "https://images.unsplash.com/photo-1650320079970-b4ee8f0dae33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
  ];

  const recentLooks = [
    { 
      date: "Today", 
      outfit: "Casual Friday", 
      items: 3,
      image: "https://images.unsplash.com/photo-1687825520757-daf83926a93e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"
    },
    { 
      date: "Yesterday", 
      outfit: "Business Meeting", 
      items: 4,
      image: "https://images.unsplash.com/photo-1769816377787-4694d3dacb18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"
    },
    { 
      date: "Feb 17", 
      outfit: "Brunch Date", 
      items: 5,
      image: "https://images.unsplash.com/photo-1765529374948-1180fd9375a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"
    },
  ];

  return (
    <div className="mobile-container relative overflow-hidden pb-32">
      <StatusBar />
      <div className="safe-area-top px-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Good morning, Alex ✨
            </h1>
            <motion.div 
              className="flex items-center gap-2 text-gray-600 glass-card-subtle rounded-full px-3 py-1.5 w-fit"
              whileHover={{ scale: 1.02 }}
            >
              <Cloud className="w-4 h-4 text-[#00C9B7]" />
              <span className="text-sm font-medium">72°F, Partly cloudy</span>
            </motion.div>
          </div>
          <AvatarBubble 
            name="Alex" 
            imageUrl="https://images.unsplash.com/photo-1687825520757-daf83926a93e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100"
          />
        </div>

        {/* Today's Outfit Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="mb-6 border-glow overflow-hidden">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Today's Outfit</h3>
                  <p className="text-sm text-gray-600 mt-1">Cozy neutrals for brunch ☕</p>
                </div>
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 10, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <Sparkles className="w-6 h-6 text-[#00C9B7]" />
                </motion.div>
              </div>
              
              {/* 2x2 Outfit Grid with Real Images */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {todayOutfitItems.map((image, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className="aspect-square rounded-2xl overflow-hidden glass-card-subtle cursor-pointer"
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`Outfit item ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex gap-2 flex-wrap mb-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-medium">
                  <Coffee className="w-3.5 h-3.5" />
                  Brunch Ready
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-medium">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Low Effort
                </div>
                <TagChip label="Casual" active />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <PrimaryButton 
                  onClick={() => navigate("/try-on")}
                  className="flex-1 text-sm py-3"
                >
                  Try On
                </PrimaryButton>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-full glass-card-subtle font-semibold text-gray-700 text-sm border-2 border-violet-200"
                >
                  Why?
                </motion.button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="flex gap-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -4 }}
            onClick={() => navigate("/add-item")}
            className="flex-1 glass-card rounded-2xl p-4 flex flex-col items-center gap-2 border border-violet-200"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6E4AE0] to-[#A78BFA] flex items-center justify-center shadow-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Add Item</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -4 }}
            onClick={() => navigate("/outfits")}
            className="flex-1 glass-card rounded-2xl p-4 flex flex-col items-center gap-2 border border-teal-200"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00C9B7] to-[#14F2D4] flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Magic</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -4 }}
            onClick={() => navigate("/content-studio")}
            className="flex-1 glass-card rounded-2xl p-4 flex flex-col items-center gap-2 border border-pink-200"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E879F9] to-[#C084FC] flex items-center justify-center shadow-lg">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Share</span>
          </motion.button>
        </motion.div>

        {/* Wardrobe Glance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <SectionHeader title="Wardrobe Glance" onSeeAll={() => navigate("/wardrobe")} />
          <div className="flex gap-3 overflow-x-auto pb-2 mb-6 -mx-6 px-6 scrollbar-hide">
            {wardrobeItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="flex-shrink-0 w-28 cursor-pointer"
              >
                <div className="w-28 h-36 rounded-2xl overflow-hidden glass-card mb-2 border border-violet-100">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs font-medium text-gray-700 text-center">{item.name}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Looks */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <SectionHeader title="Recent Looks" />
          <div className="space-y-3">
            {recentLooks.map((look, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <GlassCard hoverable className="flex items-center gap-4 cursor-pointer border border-violet-100">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={look.image}
                      alt={look.outfit}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{look.outfit}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-sm text-gray-500">{look.date} • {look.items} items</p>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="text-[#00C9B7]"
                  >
                    →
                  </motion.div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <BottomTabBar />
    </div>
  );
}
