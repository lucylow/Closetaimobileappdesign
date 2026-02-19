import { useState } from "react";
import { ChevronLeft, Copy, Check, Download, Instagram, Sparkles, Heart } from "lucide-react";
import { TagChip } from "../design-system/TagChip";
import { PrimaryButton } from "../design-system/PrimaryButton";
import { GlassCard } from "../design-system/GlassCard";
import { AvatarBubble } from "../design-system/AvatarBubble";
import { StatusBar } from "../design-system/StatusBar";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const outfitThumbnails = [
  { 
    id: 1, 
    image: "https://images.unsplash.com/photo-1687825520757-daf83926a93e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300"
  },
  { 
    id: 2, 
    image: "https://images.unsplash.com/photo-1769816377787-4694d3dacb18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300"
  },
  { 
    id: 3, 
    image: "https://images.unsplash.com/photo-1765529374948-1180fd9375a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300"
  },
  { 
    id: 4, 
    image: "https://images.unsplash.com/photo-1768929096134-f45af7839e83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300"
  },
];

const toneOptions = [
  { label: "Chill", emoji: "😌", description: "Relaxed & casual" },
  { label: "Playful", emoji: "✨", description: "Fun & energetic" },
  { label: "Professional", emoji: "💼", description: "Polished & refined" }
];

const hashtags = ["#OOTD", "#Fashion", "#Style", "#ClosetAI", "#OutfitInspo", "#Fashionista"];

const captions = {
  Chill: "Just vibing in today's fit ✨ Keeping it simple but stylish. What do you think?",
  Playful: "Feeling absolutely fabulous in today's outfit! 💜✨ This color combo is everything I needed for a confidence boost. Rate this look! 🔥",
  Professional: "Elevated essentials for today's agenda. Clean lines, timeless pieces, intentional styling. Professional yet approachable."
};

export function ContentStudioScreen() {
  const [selectedOutfit, setSelectedOutfit] = useState(0);
  const [selectedTone, setSelectedTone] = useState("Playful");
  const [activeHashtags, setActiveHashtags] = useState([0, 1, 2, 3]);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const caption = `${captions[selectedTone as keyof typeof captions]}\n\n${activeHashtags.map(i => hashtags[i]).join(" ")}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 1500);
  };

  const toggleHashtag = (index: number) => {
    setActiveHashtags(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="mobile-container relative overflow-hidden">
      <StatusBar />
      <div className="safe-area-top h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-violet-100">
          <motion.button 
            onClick={() => navigate(-1)} 
            className="p-2 glass-card rounded-full"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </motion.button>
          <div className="flex items-center gap-2">
            <Instagram className="w-5 h-5 text-[#E879F9]" />
            <h1 className="text-lg font-bold text-gray-900">Content Studio</h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleGenerate}
            className="p-2 glass-card rounded-full"
          >
            <Sparkles className="w-5 h-5 text-[#00C9B7]" />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
            {/* Outfit Carousel */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Outfit Photo</h3>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {outfitThumbnails.map((outfit, index) => (
                  <motion.button
                    key={outfit.id}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedOutfit(index)}
                    className={`
                      flex-shrink-0 w-24 h-32 rounded-2xl overflow-hidden relative
                      ${selectedOutfit === index 
                        ? 'ring-4 ring-[#00C9B7] scale-110' 
                        : 'opacity-60'
                      }
                      transition-all
                    `}
                    layout
                  >
                    <ImageWithFallback
                      src={outfit.image}
                      alt={`Outfit ${outfit.id}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedOutfit === index && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 bg-[#00C9B7]/20 flex items-center justify-center"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#00C9B7] flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Caption Tone */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Caption Tone</h3>
              <div className="grid grid-cols-3 gap-2">
                {toneOptions.map((tone) => (
                  <motion.button
                    key={tone.label}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTone(tone.label)}
                    className={`
                      py-3 rounded-2xl text-center transition-all
                      ${selectedTone === tone.label 
                        ? 'bg-gradient-to-br from-[#6E4AE0] to-[#A78BFA] text-white shadow-lg border-glow' 
                        : 'glass-card text-gray-700 border border-violet-200'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{tone.emoji}</div>
                    <div className="text-sm font-semibold">{tone.label}</div>
                    <div className="text-xs opacity-80">{tone.description}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* AI Generate Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              className="w-full mb-6 py-3 rounded-2xl glass-card border-2 border-dashed border-violet-300 flex items-center justify-center gap-2 font-semibold text-violet-700"
            >
              <Sparkles className="w-5 h-5" />
              {isGenerating ? "Generating..." : "✨ AI Enhance Caption"}
            </motion.button>

            {/* Caption Preview */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Generated Caption</h3>
              <GlassCard className="mb-4 border border-violet-200">
                <AnimatePresence mode="wait">
                  <motion.textarea
                    key={selectedTone}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    value={caption}
                    onChange={(e) => {}}
                    className="w-full h-32 bg-transparent outline-none resize-none text-gray-700 text-sm"
                    placeholder="Your AI-generated caption will appear here..."
                  />
                </AnimatePresence>
              </GlassCard>

              {/* Character Count */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-500">
                  {caption.length} / 2,200 characters
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card border border-violet-200 text-sm font-medium text-gray-700"
                >
                  {copied ? <Check className="w-4 h-4 text-[#00C9B7]" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </motion.button>
              </div>
            </div>

            {/* Hashtags */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Hashtags</h3>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, index) => (
                  <motion.button
                    key={tag}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleHashtag(index)}
                    className={`
                      px-3 py-2 rounded-full text-sm font-medium transition-all
                      ${activeHashtags.includes(index)
                        ? 'bg-[#00C9B7] text-white shadow-lg'
                        : 'glass-card text-gray-600 border border-violet-200'
                      }
                    `}
                  >
                    {tag}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Instagram Preview */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Instagram Preview</h3>
              <GlassCard className="border-glow border-2 border-violet-200 overflow-hidden">
                {/* Instagram Header */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-violet-100">
                  <AvatarBubble 
                    name="Alex" 
                    size="sm"
                    imageUrl="https://images.unsplash.com/photo-1687825520757-daf83926a93e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">alex.stylist</p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                  <div className="text-2xl">•••</div>
                </div>

                {/* Image */}
                <motion.div 
                  className="aspect-square rounded-2xl mb-3 overflow-hidden -mx-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <ImageWithFallback
                    src={outfitThumbnails[selectedOutfit].image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Actions */}
                <div className="flex items-center gap-4 mb-3 px-2">
                  <Heart className="w-6 h-6 text-gray-700" />
                  <div className="w-6 h-6 text-gray-700">💬</div>
                  <div className="w-6 h-6 text-gray-700">✈️</div>
                  <div className="ml-auto">🔖</div>
                </div>

                {/* Caption Preview */}
                <div className="text-sm text-gray-700 px-2">
                  <span className="font-semibold">alex.stylist</span>{" "}
                  {caption.split('\n')[0].substring(0, 100)}
                  {caption.split('\n')[0].length > 100 && "... "}
                  <span className="text-gray-500">more</span>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-6 pb-6 safe-area-bottom space-y-3 border-t border-violet-100 pt-4 bg-gradient-to-t from-white to-transparent">
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="py-3.5 rounded-2xl glass-card font-semibold text-gray-700 flex items-center justify-center gap-2 border-2 border-violet-200"
            >
              <Download className="w-5 h-5" />
              Save Image
            </motion.button>
            <PrimaryButton onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy All
                </>
              )}
            </PrimaryButton>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#E879F9] to-[#C084FC] text-white font-bold flex items-center justify-center gap-2 shadow-xl"
          >
            <Instagram className="w-5 h-5" />
            Share to Instagram
          </motion.button>
        </div>
      </div>
    </div>
  );
}
