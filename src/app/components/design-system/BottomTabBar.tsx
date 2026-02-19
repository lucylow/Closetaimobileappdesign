import { motion } from "motion/react";
import { Home, Shirt, Sparkles, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

export function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Shirt, label: "Wardrobe", path: "/wardrobe" },
    { icon: Sparkles, label: "Outfits", path: "/outfits" },
    { icon: User, label: "Profile", path: "/settings" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 pb-safe z-50">
      <div className="mobile-container">
        <div className="absolute bottom-8 left-4 right-4">
          <div className="glass-card rounded-full px-6 py-3 flex items-center justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              
              return (
                <motion.button
                  key={tab.path}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate(tab.path)}
                  className="relative flex flex-col items-center gap-1 py-2 px-4"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-violet-100 to-purple-100 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon 
                    className={`w-6 h-6 relative z-10 transition-colors ${
                      isActive ? 'text-[#6E4AE0]' : 'text-gray-400'
                    }`} 
                  />
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-1.5 h-1.5 rounded-full bg-[#6E4AE0] relative z-10"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
