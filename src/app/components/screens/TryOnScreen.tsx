import { useState } from "react";
import { ChevronLeft, Camera, Sparkles, ArrowLeftRight, Save, Share2 } from "lucide-react";
import { PrimaryButton } from "../design-system/PrimaryButton";
import { StatusBar } from "../design-system/StatusBar";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const garmentOptions = [
  { 
    id: 1, 
    name: "White Tee", 
    image: "https://images.unsplash.com/photo-1722310752951-4d459d28c678?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300"
  },
  { 
    id: 2, 
    name: "Summer Dress", 
    image: "https://images.unsplash.com/photo-1602303894456-398ce544d90b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300"
  },
  { 
    id: 3, 
    name: "Leather Jacket", 
    image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300"
  },
  { 
    id: 4, 
    name: "Casual Tee", 
    image: "https://images.unsplash.com/photo-1770825491966-7b9c3124edad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300"
  },
];

const loadingSteps = [
  "Analyzing body shape...",
  "Matching fabric texture...",
  "Adjusting lighting...",
  "Rendering final look ✨"
];

export function TryOnScreen() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedGarment, setSelectedGarment] = useState(0);
  const [sliderValue, setSliderValue] = useState(50);
  const [loadingStep, setLoadingStep] = useState(0);
  const [hasPhoto, setHasPhoto] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = () => {
    if (!hasPhoto) {
      setHasPhoto(true);
      return;
    }

    setIsGenerating(true);
    setLoadingStep(0);
    
    // Simulate loading steps
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setIsGenerating(false);
            setShowResult(true);
          }, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
  };

  const selfieImage = "https://images.unsplash.com/photo-1687825520757-daf83926a93e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500";
  const resultImage = "https://images.unsplash.com/photo-1769816377787-4694d3dacb18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500";

  return (
    <div className="mobile-container relative overflow-hidden bg-gradient-to-br from-[#F8F9FF] to-[#EEF0FF]">
      <StatusBar />
      <div className="safe-area-top h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <motion.button 
            onClick={() => navigate(-1)} 
            className="p-2 glass-card rounded-full"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </motion.button>
          <h1 className="text-lg font-bold text-gray-900">AI Try-On Magic</h1>
          <div className="w-10" />
        </div>

        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 px-6 flex flex-col"
            >
              {/* Split Layout */}
              <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                {/* Selfie Picker */}
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Photo</h3>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setHasPhoto(true)}
                    className="flex-1 rounded-3xl overflow-hidden relative"
                  >
                    {hasPhoto ? (
                      <>
                        <ImageWithFallback
                          src={selfieImage}
                          alt="Your photo"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-4">
                          <span className="text-white text-xs font-medium">Change Photo</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full border-3 border-dashed border-violet-300 bg-violet-50 flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6E4AE0] to-[#A78BFA] flex items-center justify-center">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs text-violet-700 font-medium">Upload</span>
                      </div>
                    )}
                  </motion.button>
                </div>

                {/* Garment Preview */}
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Selected Item</h3>
                  <motion.div 
                    className="flex-1 rounded-3xl overflow-hidden border-3 border-[#00C9B7] relative"
                    whileHover={{ scale: 1.02 }}
                    layout
                  >
                    <ImageWithFallback
                      src={garmentOptions[selectedGarment].image}
                      alt={garmentOptions[selectedGarment].name}
                      className="w-full h-full object-cover"
                    />
                    <motion.div 
                      className="absolute top-2 right-2 bg-[#00C9B7] text-white px-2 py-1 rounded-full text-xs font-medium"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      ✓ Selected
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* Garment Carousel */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Choose Garment</h3>
                  <span className="text-xs text-gray-500">{selectedGarment + 1} of {garmentOptions.length}</span>
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {garmentOptions.map((garment, index) => (
                    <motion.button
                      key={garment.id}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedGarment(index)}
                      className={`
                        flex-shrink-0 w-24 h-32 rounded-2xl overflow-hidden
                        ${selectedGarment === index ? 'ring-4 ring-[#00C9B7]' : 'opacity-60'}
                        transition-all relative
                      `}
                      layout
                    >
                      <ImageWithFallback
                        src={garment.image}
                        alt={garment.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedGarment === index && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 bg-[#00C9B7]/20 flex items-center justify-center"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#00C9B7] flex items-center justify-center">
                            <span className="text-white text-lg">✓</span>
                          </div>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="pb-6 safe-area-bottom">
                <PrimaryButton
                  fullWidth
                  loading={isGenerating}
                  onClick={handleGenerate}
                  disabled={!hasPhoto && !isGenerating}
                >
                  <Sparkles className="w-5 h-5" />
                  {!hasPhoto ? "Upload Photo First" : "Generate Try-On"}
                </PrimaryButton>
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4"
                    >
                      <div className="glass-card rounded-2xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 rounded-full border-3 border-[#6E4AE0] border-t-transparent"
                          />
                          <p className="text-sm font-medium text-gray-700">
                            {loadingSteps[loadingStep]}
                          </p>
                        </div>
                        <div className="w-full h-2 bg-violet-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#6E4AE0] to-[#00C9B7]"
                            initial={{ width: "0%" }}
                            animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 px-6 flex flex-col"
            >
              <motion.h2 
                className="text-2xl font-bold text-gray-900 mb-2 text-center"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Your Virtual Try-On ✨
              </motion.h2>
              <motion.p 
                className="text-gray-600 text-center mb-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Drag the slider to compare
              </motion.p>

              {/* Before/After Slider */}
              <motion.div 
                className="relative flex-1 mb-4 rounded-3xl overflow-hidden glass-card border-glow"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="absolute inset-0 flex">
                  {/* Before */}
                  <div
                    className="relative h-full overflow-hidden"
                    style={{ width: `${100 - sliderValue}%` }}
                  >
                    <ImageWithFallback
                      src={selfieImage}
                      alt="Before"
                      className="h-full w-full object-cover"
                      style={{ width: '393px' }}
                    />
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                      Before
                    </div>
                  </div>
                  
                  {/* After */}
                  <div
                    className="relative h-full overflow-hidden"
                    style={{ width: `${sliderValue}%` }}
                  >
                    <div 
                      className="h-full"
                      style={{ 
                        width: '393px',
                        marginLeft: `${-(100 - sliderValue) / 100 * 393}px`
                      }}
                    >
                      <ImageWithFallback
                        src={resultImage}
                        alt="After"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute top-4 right-4 bg-[#00C9B7] text-white px-3 py-1 rounded-full text-sm font-medium">
                      After ✨
                    </div>
                  </div>
                </div>

                {/* Slider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl"
                  style={{ left: `${100 - sliderValue}%` }}
                >
                  <motion.div 
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-[#6E4AE0] to-[#E879F9] border-4 border-white shadow-2xl cursor-grab active:cursor-grabbing flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeftRight className="w-5 h-5 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Slider Control */}
              <div className="mb-6">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="w-full h-2 bg-violet-200 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #6E4AE0 0%, #6E4AE0 ${sliderValue}%, #E5E7EB ${sliderValue}%, #E5E7EB 100%)`
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-6 safe-area-bottom">
                <div className="grid grid-cols-3 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowResult(false)}
                    className="py-3 rounded-2xl glass-card font-semibold text-gray-700 flex items-center justify-center gap-2 border border-violet-200"
                  >
                    <Camera className="w-4 h-4" />
                    New
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="py-3 rounded-2xl glass-card font-semibold text-gray-700 flex items-center justify-center gap-2 border border-violet-200"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/content-studio")}
                    className="py-3 rounded-2xl bg-gradient-to-r from-[#00C9B7] to-[#14F2D4] text-white font-semibold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </motion.button>
                </div>
                <PrimaryButton fullWidth onClick={() => navigate("/content-studio")}>
                  Create Instagram Post
                </PrimaryButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
