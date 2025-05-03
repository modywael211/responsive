import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CoinFlipperProps {
  onClose: () => void;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

interface CoinStyle {
  id: "classic" | "quantum" | "galaxy" | "crypto" | "elemental" | "matrix" | "rainbow" | "neon" | "custom";
  name: string;
  description: string;
  frontGradient: string;
  backGradient: string;
  textColor: string;
  animation?: string;
  unlockCondition?: number;
  particleColor?: string;
  customImage?: string;
  danceAnimation?: string;
}

interface PowerUp {
  id: string;
  name: string;
  description: string;
  duration: number;
  cooldown: number;
  isActive: boolean;
  lastUsed: number;
  icon: string;
}

interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  target: number;
  progress: number;
  reward: string;
  completed: boolean;
  expiresAt: number;
}

interface Stats {
  heads: number;
  tails: number;
  streakCount: number;
  longestStreak: number;
  lastResult: "heads" | "tails" | null;
  perfectFlips: number;
  totalTime: number;
}

interface CustomCoin {
  image: string;
  name: string;
}

interface DanceAnimation {
  name: string;
  emoji: string;
  duration: number;
}

export function CoinFlipper({ onClose }: CoinFlipperProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [flipCount, setFlipCount] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [lastFlipTime, setLastFlipTime] = useState(Date.now());
  const [showConfetti, setShowConfetti] = useState(false);
  const [stats, setStats] = useState<Stats>({
    heads: 0,
    tails: 0,
    streakCount: 0,
    longestStreak: 0,
    lastResult: null,
    perfectFlips: 0,
    totalTime: 0
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showParticles, setShowParticles] = useState(false);
  const [coinStyle, setCoinStyle] = useState<CoinStyle["id"]>("quantum");
  const [showStats, setShowStats] = useState(false);
  const { toast } = useToast();
  const [customCoin, setCustomCoin] = useState<CustomCoin | null>(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showDance, setShowDance] = useState(false);
  const [danceType, setDanceType] = useState<string>("victory");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [currentMusic, setCurrentMusic] = useState<string | null>(null);
  const [musicVolume, setMusicVolume] = useState(50);
  const [showFireworks, setShowFireworks] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<"default" | "custom">("default");
  const [customMusic, setCustomMusic] = useState<{heads: string; tails: string}>({
    heads: "",
    tails: ""
  });

  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    {
      id: "double_flip",
      name: "Double Flip",
      description: "Flip two coins at once for 30 seconds",
      duration: 30000,
      cooldown: 60000,
      isActive: false,
      lastUsed: 0,
      icon: "⚡"
    },
    {
      id: "lucky_streak",
      name: "Lucky Streak",
      description: "Increased chance of continuing streaks for 20 seconds",
      duration: 20000,
      cooldown: 90000,
      isActive: false,
      lastUsed: 0,
      icon: "🍀"
    },
    {
      id: "time_warp",
      name: "Time Warp",
      description: "Reduce flip animation time by 50% for 15 seconds",
      duration: 15000,
      cooldown: 45000,
      isActive: false,
      lastUsed: 0,
      icon: "⌛"
    }
  ]);

  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([
    {
      id: "speed_demon",
      name: "Speed Demon",
      description: "Flip 20 coins in under 30 seconds",
      target: 20,
      progress: 0,
      reward: "Unlock Time Warp power-up",
      completed: false,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    },
    {
      id: "perfect_balance",
      name: "Perfect Balance",
      description: "Get exactly 50% heads and 50% tails in 30 flips",
      target: 30,
      progress: 0,
      reward: "Unlock Lucky Streak power-up",
      completed: false,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    }
  ]);

  const [showPowerUps, setShowPowerUps] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [lastFlipSpeed, setLastFlipSpeed] = useState(0);
  const [flipStartTime, setFlipStartTime] = useState(0);

  const danceAnimations: DanceAnimation[] = [
    { name: "victory", emoji: "🕺", duration: 1500 },
    { name: "robot", emoji: "🤖", duration: 1800 },
    { name: "disco", emoji: "💃", duration: 2000 },
    { name: "moonwalk", emoji: "👟", duration: 1800 },
    { name: "breakdance", emoji: "🌀", duration: 2000 },
    { name: "floss", emoji: "🎮", duration: 1800 }
  ];

  const musicOptions = {
    default: {
      heads: [
        { url: "https://www.youtube.com/watch?v=3GwjfUFyY6M", name: "Celebration" },
        { url: "https://www.youtube.com/watch?v=04854XqcfCY", name: "We Are The Champions" }
      ],
      tails: [
        { url: "https://www.youtube.com/watch?v=Y5qKNlcUwKs", name: "Suspense" },
        { url: "https://www.youtube.com/watch?v=2WPCLda_erI", name: "Dramatic" }
      ]
    }
  };

  const coinStyles: CoinStyle[] = [
    {
      id: "classic",
      name: "Classic",
      description: "The traditional coin style",
      frontGradient: "from-yellow-400 to-yellow-600",
      backGradient: "from-yellow-500 to-yellow-700",
      textColor: "text-white",
    },
    {
      id: "quantum",
      name: "Quantum",
      description: "A futuristic quantum style with mesmerizing effects",
      frontGradient: "from-blue-400 via-purple-500 to-indigo-600",
      backGradient: "from-indigo-600 via-purple-500 to-blue-400",
      textColor: "text-white",
      animation: "animate-quantum",
    },
    {
      id: "galaxy",
      name: "Galaxy",
      description: "A cosmic-themed style",
      frontGradient: "from-indigo-500 via-purple-500 to-pink-500",
      backGradient: "from-pink-500 via-purple-500 to-indigo-500",
      textColor: "text-white",
      animation: "animate-galaxy",
      unlockCondition: 5,
    },
    {
      id: "crypto",
      name: "Crypto",
      description: "A digital currency style",
      frontGradient: "from-orange-400 to-orange-600",
      backGradient: "from-orange-600 to-orange-800",
      textColor: "text-white",
      animation: "animate-crypto",
      unlockCondition: 10,
    },
    {
      id: "elemental",
      name: "Elemental",
      description: "A nature-inspired style",
      frontGradient: "from-green-400 to-emerald-600",
      backGradient: "from-emerald-600 to-green-800",
      textColor: "text-white",
      animation: "animate-elemental",
      unlockCondition: 15,
    },
    {
      id: "matrix",
      name: "Matrix",
      description: "A digital matrix style",
      frontGradient: "from-green-500 to-green-900",
      backGradient: "from-green-900 to-green-500",
      textColor: "text-green-300",
      animation: "animate-matrix",
      unlockCondition: 20,
    },
    {
      id: "rainbow",
      name: "Rainbow",
      description: "A colorful rainbow style",
      frontGradient: "from-red-500 via-yellow-500 to-blue-500",
      backGradient: "from-blue-500 via-yellow-500 to-red-500",
      textColor: "text-white",
      animation: "animate-rainbow",
      unlockCondition: 25,
    },
    {
      id: "neon",
      name: "Neon",
      description: "A bright neon style",
      frontGradient: "from-pink-500 via-purple-500 to-cyan-500",
      backGradient: "from-cyan-500 via-purple-500 to-pink-500",
      textColor: "text-white",
      animation: "animate-neon",
      unlockCondition: 30,
    },
    {
      id: "custom",
      name: "Custom",
      description: "Your custom coin style",
      frontGradient: "",
      backGradient: "",
      textColor: "text-white",
    },
  ];

  // Achievement system with more achievements
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "first_flip",
      name: "First Flip",
      description: "Flip your first coin",
      unlocked: false,
      progress: 0,
      target: 1
    },
    {
      id: "streak_master",
      name: "Streak Master",
      description: "Get a streak of 5",
      unlocked: false,
      progress: 0,
      target: 5
    },
    {
      id: "flip_enthusiast",
      name: "Flip Enthusiast",
      description: "Flip 50 coins",
      unlocked: false,
      progress: 0,
      target: 50
    },
    {
      id: "perfect_balance",
      name: "Perfect Balance",
      description: "Get 10 alternating heads and tails",
      unlocked: false,
      progress: 0,
      target: 10
    },
    {
      id: "speed_flipper",
      name: "Speed Flipper",
      description: "Flip 10 coins in under 30 seconds",
      unlocked: false,
      progress: 0,
      target: 10
    },
    {
      id: "coin_collector",
      name: "Coin Collector",
      description: "Unlock all coin styles",
      unlocked: false,
      progress: 0,
      target: coinStyles.length
    }
  ]);

  // Sound effect references with better organization
  const soundRefs = {
    flipStart: useRef<HTMLAudioElement | null>(null),
    spinning: useRef<HTMLAudioElement | null>(null),
    heads: useRef<HTMLAudioElement | null>(null),
    tails: useRef<HTMLAudioElement | null>(null),
    streak: useRef<HTMLAudioElement | null>(null),
    achievement: useRef<HTMLAudioElement | null>(null),
    ambient: useRef<HTMLAudioElement | null>(null),
    unlock: useRef<HTMLAudioElement | null>(null),
  };

  // Updated sound URLs with different effects for heads and tails
  const soundURLs = {
    flipStart: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
    spinning: "https://assets.mixkit.co/active_storage/sfx/2009/2009-preview.mp3",
    heads: "https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3", // Victory sound
    tails: "https://assets.mixkit.co/active_storage/sfx/2873/2873-preview.mp3", // Different tone
    streak: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
    achievement: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
    ambient: "https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3",
    unlock: "https://assets.mixkit.co/active_storage/sfx/2/2-preview.mp3",
  };

  // Load sound effects
  useEffect(() => {
    const loadSound = (key: keyof typeof soundURLs, volume: number, loop = false) => {
      const audio = new Audio(soundURLs[key]);
      audio.volume = volume;
      audio.loop = loop;
      return audio;
    };

    try {
      soundRefs.flipStart.current = loadSound("flipStart", 0.2);
      soundRefs.spinning.current = loadSound("spinning", 0.15, true);
      soundRefs.heads.current = loadSound("heads", 0.25);
      soundRefs.tails.current = loadSound("tails", 0.25);
      soundRefs.streak.current = loadSound("streak", 0.3);
      soundRefs.achievement.current = loadSound("achievement", 0.35);
      soundRefs.ambient.current = loadSound("ambient", 0.03, true);
      soundRefs.unlock.current = loadSound("unlock", 0.3);

      if (soundEnabled && soundRefs.ambient.current) {
        soundRefs.ambient.current.play().catch(() => {});
      }
    } catch (error) {
      console.error("Error loading audio:", error);
    }

    return () => {
      Object.values(soundRefs).forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current.src = "";
          ref.current.load();
        }
      });
    };
  }, [soundEnabled]);

  // Sound toggle with proper cleanup
  useEffect(() => {
    const ambient = soundRefs.ambient.current;
    if (ambient) {
      if (soundEnabled) {
        ambient.play().catch(() => {});
      } else {
        ambient.pause();
      }
    }
  }, [soundEnabled]);

  // Play sound helper with better error handling
  const playSound = (key: keyof typeof soundURLs) => {
    if (!soundEnabled) return;
    const sound = soundRefs[key].current;
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(err => {
        console.error(`Error playing ${key} sound:`, err);
        if (key === "heads" || key === "tails") {
          soundRefs.flipStart.current?.play().catch(() => {});
        }
      });
    }
  };

  // Check and update achievements with more conditions
  const checkAchievements = useCallback(() => {
    setAchievements(prev => prev.map(achievement => {
      let progress = achievement.progress;
      let unlocked = achievement.unlocked;

      switch (achievement.id) {
        case "first_flip":
          progress = Math.min(1, flipCount);
          break;
        case "streak_master":
          progress = Math.min(achievement.target, stats.streakCount);
          break;
        case "flip_enthusiast":
          progress = Math.min(achievement.target, flipCount);
          break;
        case "perfect_balance":
          progress = Math.min(achievement.target, stats.perfectFlips);
          break;
        case "speed_flipper":
          if (stats.totalTime > 0 && stats.totalTime <= 30) {
            progress = Math.min(achievement.target, flipCount);
          }
          break;
        case "coin_collector":
          progress = coinStyles.filter(style => !style.unlockCondition || flipCount >= style.unlockCondition).length;
          break;
      }

      if (progress >= achievement.target && !unlocked) {
        unlocked = true;
        playSound("achievement");
        toast({
          title: "Achievement Unlocked!",
          description: `${achievement.name} - ${achievement.description}`,
          duration: 5000,
        });
      }

      return { ...achievement, progress, unlocked };
    }));
  }, [flipCount, stats, toast]);

  // Combo system
  useEffect(() => {
    const timeSinceLastFlip = Date.now() - lastFlipTime;
    if (timeSinceLastFlip < 2000) { // 2 seconds window for combos
      setComboMultiplier(prev => Math.min(prev + 1, 5));
    } else {
      setComboMultiplier(1);
    }
  }, [flipCount, lastFlipTime]);

  // Power-up management
  const activatePowerUp = useCallback((powerUpId: string) => {
    setPowerUps(prev => prev.map(p => {
      if (p.id === powerUpId && Date.now() - p.lastUsed >= p.cooldown) {
        playSound("achievement");
        toast({
          title: `${p.icon} Power-up Activated!`,
          description: p.description,
        });
        return { ...p, isActive: true, lastUsed: Date.now() };
      }
      return p;
    }));

    // Deactivate power-up after duration
    setTimeout(() => {
      setPowerUps(prev => prev.map(p => 
        p.id === powerUpId ? { ...p, isActive: false } : p
      ));
    }, powerUps.find(p => p.id === powerUpId)?.duration || 0);
  }, [powerUps, toast]);

  // Update daily challenges
  useEffect(() => {
    const interval = setInterval(() => {
      setDailyChallenges(prev => prev.map(challenge => {
        if (Date.now() > challenge.expiresAt) {
          // Reset expired challenge
          return {
            ...challenge,
            progress: 0,
            completed: false,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000
          };
        }
        return challenge;
      }));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Handle custom image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const image = e.target?.result as string;
        setCustomCoin({
          image,
          name: file.name
        });
        setCoinStyle("custom");
        toast({
          title: "🎨 Custom Coin Added!",
          description: "Your personalized coin is ready to flip!",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Enhanced particle effect with more particles for streaks
  const Particles = () => {
    const particleCount = Math.min(stats.streakCount * 10, 50); // More particles based on streak
    const emojis = stats.lastResult === "heads" 
      ? ["👑", "✨", "⭐", "🌟"] 
      : ["🌙", "⚡", "💫", "✨"];
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: particleCount }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: [1, 1.5],
              opacity: [1, 0],
              x: Math.random() * 200 - 100,
              y: Math.random() * 200 - 100,
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 1.2,
              ease: "easeOut",
            }}
          >
            {emojis[i % emojis.length]}
          </motion.div>
        ))}
      </div>
    );
  };

  // Enhanced confetti effect for streaks
  const Confetti = () => (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: Math.min(stats.streakCount * 5, 40) }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-5%`,
            background: stats.lastResult === "heads"
              ? `hsl(${45 + Math.random() * 30}, 70%, 50%)`  // Golden colors for heads
              : `hsl(${200 + Math.random() * 60}, 70%, 50%)`, // Blue colors for tails
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          }}
          initial={{ opacity: 1, scale: 0 }}
          animate={{
            opacity: [1, 0],
            scale: [0, 1],
            y: ["0vh", "100vh"],
            rotate: [0, Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1)],
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );

  // Enhanced flip coin function with streak animations
  const flipCoin = useCallback(() => {
    if (isFlipping) return;

    setIsFlipping(true);
    setResult(null);
    setShowParticles(false);
    setShowConfetti(false);
    setLastFlipTime(Date.now());
    setFlipStartTime(Date.now());

    playSound("flipStart");
    playSound("spinning");

    const flipDuration = 750;

    setTimeout(() => {
      const newResult: "heads" | "tails" = Math.random() < 0.5 ? "heads" : "tails";
      setResult(newResult);
      setIsFlipping(false);
      setFlipCount(prev => prev + 1);

      // Play result-specific sound
      playSound(newResult);
      if (soundRefs.spinning.current) {
        soundRefs.spinning.current.pause();
        soundRefs.spinning.current.currentTime = 0;
      }

      // Update stats with streak tracking
      setStats(prev => {
        const isStreak = prev.lastResult === newResult;
        const newStreakCount = isStreak ? prev.streakCount + 1 : 1;
        
        // Enhanced effects for streaks
        if (isStreak) {
          if (newStreakCount >= 3) {
            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 1500);
          }
          if (newStreakCount >= 5) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);
            playSound("streak");
            
            // Add dance animation for long streaks
            setShowDance(true);
            setDanceType(newResult === "heads" ? "victory" : "robot");
            setTimeout(() => setShowDance(false), 2000);
          }
        }

        return {
          ...prev,
          [newResult]: prev[newResult] + 1,
          streakCount: newStreakCount,
          longestStreak: Math.max(prev.longestStreak, newStreakCount),
          lastResult: newResult,
          perfectFlips: prev.lastResult !== newResult ? prev.perfectFlips + 1 : prev.perfectFlips,
          totalTime: prev.totalTime + flipDuration / 1000
        };
      });

      // Show toast with streak info
      toast({
        title: `${newResult.toUpperCase()}!`,
        description: stats.streakCount > 1 
          ? `${stats.streakCount + 1}x Streak! 🔥` 
          : undefined,
        duration: 1500,
      });

      checkAchievements();
    }, flipDuration);
  }, [isFlipping, stats, checkAchievements, toast, playSound]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        flipCoin();
      } else if (e.code === "KeyM") {
        setSoundEnabled(prev => !prev);
      } else if (e.code === "KeyS") {
        setShowStats(true);
      } else if (e.code === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [flipCoin, onClose]);

  // Dance Animation Component
  const DanceAnimation = () => {
    const dance = danceAnimations.find(d => d.name === danceType);
    return (
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-6xl"
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: [100, 0, -20, 0],
          opacity: 1,
          rotate: danceType === "breakdance" ? 360 : 0,
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 1.5 }}
      >
        {dance?.emoji}
      </motion.div>
    );
  };

  const currentCoinStyle = coinStyles.find(style => style.id === coinStyle) || coinStyles[0];

  // Fireworks Effect Component
  const Fireworks = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4"
          initial={{
            opacity: 1,
            scale: 0,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
          }}
          animate={{
            opacity: [1, 1, 0],
            scale: [0, 1, 1],
            x: window.innerWidth / 2 + (Math.random() - 0.5) * window.innerWidth,
            y: window.innerHeight / 2 + (Math.random() - 0.5) * window.innerHeight,
          }}
          transition={{
            duration: 2,
            ease: "easeOut",
            times: [0, 0.7, 1]
          }}
        >
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: `hsl(${Math.random() * 360}, 70%, 50%)`,
              boxShadow: `0 0 20px hsl(${Math.random() * 360}, 70%, 50%)`
            }}
          />
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto min-h-screen">
      {/* Credit Watermark */}
      <div className="fixed bottom-2 right-2 text-xs text-muted-foreground opacity-70">
        Created by Mohamed Wael
      </div>

      {showFireworks && <Fireworks />}
      
      <div className="container max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen p-4 py-8 sm:py-12">
        {showParticles && <Particles />}
        {showConfetti && <Confetti />}
        {showDance && <DanceAnimation />}
        
        <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[400px] md:h-[400px] mb-8 perspective-500">
          <AnimatePresence>
            {!isFlipping && result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotateY: -180 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div 
                  className={cn(
                    "w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] md:w-[300px] md:h-[300px] rounded-full flex items-center justify-center text-3xl sm:text-4xl md:text-5xl font-bold",
                    "shadow-lg transition-all duration-300",
                    coinStyle === "custom" && customCoin
                      ? "bg-cover bg-center"
                      : `bg-gradient-to-br ${currentCoinStyle.frontGradient}`,
                    currentCoinStyle.textColor,
                    currentCoinStyle.animation,
                    stats.streakCount >= 3 && "animate-bounce"
                  )}
                  style={coinStyle === "custom" && customCoin ? {
                    backgroundImage: `url(${customCoin.image})`
                  } : undefined}
                >
                  {coinStyle !== "custom" && result.toUpperCase()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {isFlipping && (
            <motion.div
              animate={{ 
                rotateX: [0, 720],
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 1.5,
                ease: "easeInOut",
                times: [0, 0.5, 1]
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div 
                className={cn(
                  "w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] md:w-[300px] md:h-[300px] rounded-full",
                  "bg-gradient-to-br shadow-lg transition-all duration-300",
                  currentCoinStyle.backGradient,
                  currentCoinStyle.animation
                )}
              />
            </motion.div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4 mb-8 w-full max-w-3xl px-4">
          {/* Coin Types Selection */}
          <div className="flex flex-wrap justify-center gap-2 mb-4 w-full">
            {coinStyles.map((style) => {
              const isLocked = !!(style.unlockCondition && flipCount < style.unlockCondition);
              return (
                <button
                  key={style.id}
                  onClick={() => !isLocked && setCoinStyle(style.id)}
                  className={cn(
                    "px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base relative group transition-all duration-300",
                    coinStyle === style.id ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground",
                    isLocked && "cursor-not-allowed opacity-50"
                  )}
                  disabled={isLocked}
                >
                  {style.name}
                  {isLocked && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Unlock at {style.unlockCondition} flips
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full mb-6">
            <div className="bg-card rounded-lg p-3 sm:p-4 shadow-md text-center">
              <h3 className="text-xs sm:text-sm font-medium mb-1">Heads</h3>
              <p className="text-xl sm:text-2xl font-bold text-primary">{stats.heads}</p>
            </div>
            <div className="bg-card rounded-lg p-3 sm:p-4 shadow-md text-center">
              <h3 className="text-xs sm:text-sm font-medium mb-1">Tails</h3>
              <p className="text-xl sm:text-2xl font-bold text-primary">{stats.tails}</p>
            </div>
            <div className="bg-card rounded-lg p-3 sm:p-4 shadow-md text-center">
              <h3 className="text-xs sm:text-sm font-medium mb-1">Streak</h3>
              <p className="text-xl sm:text-2xl font-bold text-primary">{stats.streakCount}</p>
            </div>
            <div className="bg-card rounded-lg p-3 sm:p-4 shadow-md text-center">
              <h3 className="text-xs sm:text-sm font-medium mb-1">Best Streak</h3>
              <p className="text-xl sm:text-2xl font-bold text-primary">{stats.longestStreak}</p>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap justify-center">
            <Button
              size="lg"
              onClick={flipCoin}
              disabled={isFlipping}
              className="text-xl font-bold min-w-[150px]"
            >
              {isFlipping ? "Flipping..." : "Flip Coin"}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-12 h-12"
            >
              {soundEnabled ? "🔊" : "🔇"}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowStats(true)}
              className="w-12 h-12"
            >
              📊
            </Button>
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 w-12 h-12"
        >
          ✖️
        </Button>

        {/* Custom Coin Button */}
        <button
          onClick={() => setShowCustomizer(true)}
          className="absolute top-4 right-28 p-2 rounded-lg bg-muted hover:bg-muted/80 transition-all duration-300"
        >
          <span className="text-2xl">🎨</span>
        </button>

        {/* Custom Coin Dialog */}
        <Dialog open={showCustomizer} onOpenChange={setShowCustomizer}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Customize Your Coin</DialogTitle>
              <DialogDescription>
                <div className="space-y-4 mt-4">
                  <div className="text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Upload Custom Image
                    </button>
                    {customCoin && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden">
                          <img 
                            src={customCoin.image} 
                            alt="Custom coin" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {/* Power-ups bar */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {powerUps.map(powerUp => (
            <button
              key={powerUp.id}
              onClick={() => activatePowerUp(powerUp.id)}
              disabled={powerUp.isActive || Date.now() - powerUp.lastUsed < powerUp.cooldown}
              className={cn(
                "p-2 rounded-lg transition-all duration-300",
                "bg-muted hover:bg-muted/80",
                "relative group",
                powerUp.isActive && "animate-pulse bg-primary text-primary-foreground"
              )}
            >
              <span className="text-2xl">{powerUp.icon}</span>
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 p-2 rounded-lg bg-popover/95 invisible group-hover:visible">
                <p className="font-medium">{powerUp.name}</p>
                <p className="text-sm text-muted-foreground">{powerUp.description}</p>
                {powerUp.isActive && (
                  <p className="text-sm text-primary mt-1">Active!</p>
                )}
                {!powerUp.isActive && Date.now() - powerUp.lastUsed < powerUp.cooldown && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Cooldown: {Math.ceil((powerUp.cooldown - (Date.now() - powerUp.lastUsed)) / 1000)}s
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Daily Challenges button */}
        <button
          onClick={() => setShowChallenges(true)}
          className="absolute top-4 right-16 p-2 rounded-lg bg-muted hover:bg-muted/80 transition-all duration-300"
        >
          <span className="text-2xl">🏆</span>
        </button>

        {/* Combo indicator */}
        {comboMultiplier > 1 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-primary/20 backdrop-blur-sm rounded-full px-4 py-2"
          >
            <span className="text-2xl font-bold text-primary">
              {comboMultiplier}x Combo! 🔥
            </span>
          </motion.div>
        )}

        {/* Daily Challenges Dialog */}
        <Dialog open={showChallenges} onOpenChange={setShowChallenges}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Daily Challenges</DialogTitle>
              <DialogDescription>
                <div className="space-y-4 mt-4">
                  {dailyChallenges.map(challenge => (
                    <div 
                      key={challenge.id}
                      className={cn(
                        "bg-muted/50 rounded-lg p-4 transition-all duration-300",
                        challenge.completed && "bg-primary/10"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{challenge.name}</h4>
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                          <p className="text-sm text-primary mt-1">{challenge.reward}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono">
                            {challenge.progress}/{challenge.target}
                          </p>
                          {challenge.completed && (
                            <span className="text-primary text-sm">✓ Completed</span>
                          )}
                        </div>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Expires in: {Math.ceil((challenge.expiresAt - Date.now()) / (1000 * 60 * 60))}h
                      </p>
                    </div>
                  ))}
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <p className="text-xs sm:text-sm text-muted-foreground text-center mt-4">
          Space to flip • M to toggle sound • S for stats • Esc to close
        </p>
      </div>

      {/* Stats Modal */}
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Statistics & Achievements</DialogTitle>
            <DialogDescription>
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <h3 className="font-medium mb-2">Flip Stats</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>Total Flips:</span>
                        <span className="font-mono">{flipCount}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Longest Streak:</span>
                        <span className="font-mono">{stats.longestStreak}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Perfect Flips:</span>
                        <span className="font-mono">{stats.perfectFlips}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Heads Ratio:</span>
                        <span className="font-mono">
                          {flipCount > 0 ? `${((stats.heads / flipCount) * 100).toFixed(1)}%` : '0%'}
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <h3 className="font-medium mb-2">Time Stats</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>Total Time:</span>
                        <span className="font-mono">{Math.round(stats.totalTime)}s</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Avg. per Flip:</span>
                        <span className="font-mono">
                          {flipCount > 0 ? `${(stats.totalTime / flipCount).toFixed(1)}s` : '0s'}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Achievements</h3>
                  <div className="space-y-2">
                    {achievements.map(achievement => (
                      <div 
                        key={achievement.id}
                        className={cn(
                          "bg-muted/50 rounded-lg p-3 transition-all duration-300",
                          achievement.unlocked && "bg-primary/10"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{achievement.name}</h4>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-mono">
                              {achievement.progress}/{achievement.target}
                            </p>
                            {achievement.unlocked && (
                              <span className="text-primary text-sm">✓ Unlocked</span>
                            )}
                          </div>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
} 