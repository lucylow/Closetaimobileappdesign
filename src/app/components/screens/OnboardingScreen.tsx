import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shirt, Sparkles, Camera, Share2, ChevronRight } from "lucide-react";
import { PrimaryButton } from "../design-system/PrimaryButton";
import { StatusBar } from "../design-system/StatusBar";
import { useNavigate } from "react-router";

const slides = [
  {
    title: "Scan Your Closet",
    description: "Digitize your entire wardrobe with AI-powered recognition",
    icon: Camera,
    color: "from-violet-400 to-purple-500",
    illustration: (
      <div className="grid grid-cols-3 gap-3 w-72 mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ 
              delay: i * 0.08,
              type: "spring",
              stiffness: 200
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`aspect-square rounded-2xl bg-gradient-to-br ${
              i % 3 === 0 ? 'from-violet-300 to-purple-400' :
              i % 3 === 1 ? 'from-teal-300 to-cyan-400' :
              'from-pink-300 to-rose-400'
            } shadow-lg cursor-pointer`}
          />
        ))}
      </div>
    )
  },
  {
    title: "Smart Outfits Daily",
    description: "Get personalized outfit suggestions based on weather and occasion",
    icon: Sparkles,
    color: "from-teal-400 to-cyan-500",
    illustration: (
      <div className="w-72 mx-auto">
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="glass-card rounded-3xl p-6 border-glow relative overflow-hidden"
        >
          <motion.div
            animate={{ 
              background: [
                "linear-gradient(135deg, rgba(110, 74, 224, 0.1) 0%, rgba(0, 201, 183, 0.1) 100%)",
                "linear-gradient(135deg, rgba(0, 201, 183, 0.1) 0%, rgba(232, 121, 249, 0.1) 100%)",
                "linear-gradient(135deg, rgba(232, 121, 249, 0.1) 0%, rgba(110, 74, 224, 0.1) 100%)",
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0"
          />
          <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
            {[1, 2, 3, 4].map((i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`aspect-square rounded-xl bg-gradient-to-br ${
                  i === 1 ? 'from-teal-300 to-cyan-400' :
                  i === 2 ? 'from-violet-300 to-purple-400' :
                  i === 3 ? 'from-pink-300 to-rose-400' :
                  'from-amber-300 to-orange-400'
                } shadow-md`}
              />
            ))}
          </div>
          <div className="flex gap-2 relative z-10">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1.5 rounded-full bg-[#00C9B7] text-white text-xs font-medium"
            >
              Casual
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1.5 rounded-full bg-[#00C9B7] text-white text-xs font-medium"
            >
              Work
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  },
  {
    title: "Try Anything On",
    description: "See how clothes look on you with AI virtual try-on",
    icon: Shirt,
    color: "from-pink-400 to-rose-500",
    illustration: (
      <div className="flex gap-4 w-72 mx-auto items-center">
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05 }}
          className="flex-1 aspect-[3/4] rounded-3xl bg-gradient-to-br from-pink-200 to-rose-300 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
            Before
          </div>
        </motion.div>
        
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-3xl"
        >
          →
        </motion.div>
        
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="flex-1 aspect-[3/4] rounded-3xl bg-gradient-to-br from-violet-200 to-purple-300 shadow-xl border-4 border-[#00C9B7] relative overflow-hidden"
        >
          <div className="absolute top-3 right-3 bg-[#00C9B7] text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            After
          </div>
        </motion.div>
      </div>
    )
  },
  {
    title: "Share Your Style",
    description: "Create Instagram-ready posts with AI-generated captions",
    icon: Share2,
    color: "from-purple-400 to-pink-500",
    illustration: (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="w-72 mx-auto glass-card rounded-3xl p-5 shadow-2xl border-2 border-violet-200"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-300 to-purple-400" />
          <div className="flex-1">
            <div className="h-2 bg-gray-300 rounded w-20 mb-1" />
            <div className="h-1.5 bg-gray-200 rounded w-12" />
          </div>
        </div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="aspect-square rounded-2xl bg-gradient-to-br from-violet-200 via-pink-200 to-purple-300 mb-3 shadow-lg"
        />
        
        <div className="space-y-2">
          <motion.div 
            animate={{ width: ["60%", "75%", "60%"] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="h-2 bg-gray-300 rounded"
          />
          <motion.div 
            animate={{ width: ["40%", "50%", "40%"] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            className="h-2 bg-gray-300 rounded"
          />
        </div>
      </motion.div>
    )
  }
];

export function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/home");
    }
  };

  const Icon = slides[currentSlide].icon;

  return (
    <div className="mobile-container relative overflow-hidden bg-gradient-to-br from-[#F8F9FF] via-[#EEF0FF] to-[#F8F9FF]">
      <StatusBar />
      <div className="h-full flex flex-col safe-area-top safe-area-bottom">
        {/* Skip button */}
        <div className="flex justify-end p-6">
          <motion.button 
            onClick={() => navigate("/home")}
            whileTap={{ scale: 0.95 }}
            className="text-gray-500 font-medium px-4 py-2 rounded-full glass-card-subtle"
          >
            Skip
          </motion.button>
        </div>

        {/* Slide content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
              className="text-center w-full"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className={`w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center shadow-2xl`}
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>

              {/* Illustration */}
              <div className="mb-12">
                {slides[currentSlide].illustration}
              </div>
              
              {/* Text */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {slides[currentSlide].title}
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {slides[currentSlide].description}
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentSlide(index)}
              animate={{
                width: currentSlide === index ? 32 : 8,
                backgroundColor: currentSlide === index ? "#6E4AE0" : "#D1D5DB"
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="h-2 rounded-full transition-all cursor-pointer"
            />
          ))}
        </div>

        {/* CTA Button */}
        <div className="px-6 pb-4">
          <PrimaryButton fullWidth onClick={handleNext}>
            {currentSlide === slides.length - 1 ? (
              <>
                Get Started
                <Sparkles className="w-5 h-5" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
