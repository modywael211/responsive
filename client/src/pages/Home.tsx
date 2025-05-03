import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useTransform, useInView, useMotionValueEvent } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CoinFlipper } from "@/components/CoinFlipper";

function AnimatedText({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    margin: "-100px",
    amount: 0.3 // Only trigger when 30% of the element is visible
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ 
        duration: 0.6,
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
}

export function Home() {
  const [showFlipper, setShowFlipper] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
  const lastScrollY = useRef(0);

  // Track scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection("down");
      } else {
        setScrollDirection("up");
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {showFlipper ? (
        <CoinFlipper onClose={() => setShowFlipper(false)} />
      ) : (
        <div className="min-h-screen bg-background">
          {/* Navigation Bar */}
          <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-50 border-b"
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex justify-between items-center">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl font-bold text-primary"
                >
                  QuantumFlip
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex gap-6"
                >
                  <a href="#about" className="hover:text-primary transition-colors">About</a>
                  <a href="#features" className="hover:text-primary transition-colors">Features</a>
                  <a href="#creator" className="hover:text-primary transition-colors">Creator</a>
                </motion.div>
              </div>
            </div>
          </motion.nav>

          {/* Progress Bar */}
          <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-primary z-50"
            style={{ scaleX, transformOrigin: "0%" }}
          />

          {/* Hero Section */}
          <section className="h-screen flex items-center justify-center relative overflow-hidden">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600"
              >
                Welcome to QuantumFlip
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4"
              >
                Experience the future of coin flipping with quantum-inspired animations and rewards
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
            >
              <p className="text-sm text-muted-foreground">Scroll to explore</p>
              <div className="w-6 h-6 border-2 border-primary rounded-full mx-auto mt-2" />
            </motion.div>
          </section>

          {/* About Section */}
          <section id="about" className="min-h-screen flex items-center justify-center py-20">
            <div className="container mx-auto px-4">
              <AnimatedText>
                <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-center">About QuantumFlip</h2>
              </AnimatedText>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  <AnimatedText delay={0.2}>
                    <p className="text-lg">
                      QuantumFlip is not just another coin flipper. It's a unique experience that combines
                      beautiful animations, engaging rewards, and quantum-inspired visuals to make every flip
                      exciting.
                    </p>
                  </AnimatedText>
                  <AnimatedText delay={0.4}>
                    <p className="text-lg">
                      With multiple coin styles, achievements, and special effects, you'll never look at
                      coin flipping the same way again.
                    </p>
                  </AnimatedText>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.8 }}
                  className="relative h-60 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-lg"
                />
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="min-h-screen flex items-center justify-center py-20 bg-muted/50">
            <div className="container mx-auto px-4">
              <AnimatedText>
                <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-center">Amazing Features</h2>
              </AnimatedText>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatedText delay={0.2}>
                  <FeatureCard
                    title="Quantum Styles"
                    description="Multiple beautiful coin styles with quantum-inspired animations"
                    icon="✨"
                  />
                </AnimatedText>
                <AnimatedText delay={0.4}>
                  <FeatureCard
                    title="Quick Rewards"
                    description="Earn achievements and unlock new styles with just a few flips"
                    icon="🏆"
                  />
                </AnimatedText>
                <AnimatedText delay={0.6}>
                  <FeatureCard
                    title="Special Effects"
                    description="Enjoy stunning visual effects and animations for streaks"
                    icon="🎉"
                  />
                </AnimatedText>
              </div>
            </div>
          </section>

          {/* Creator Section */}
          <section id="creator" className="min-h-screen flex items-center justify-center py-20">
            <div className="container mx-auto px-4 text-center">
              <AnimatedText>
                <h2 className="text-3xl sm:text-4xl font-bold mb-10">Created with ❤️</h2>
              </AnimatedText>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl mx-auto bg-card rounded-lg p-8 shadow-lg"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="w-32 h-32 rounded-full bg-gradient-to-r from-primary to-purple-600 mx-auto mb-6"
                />
                <AnimatedText delay={0.4}>
                  <h3 className="text-2xl font-bold mb-4">Mohamed Wael</h3>
                </AnimatedText>
                <AnimatedText delay={0.6}>
                  <p className="text-muted-foreground mb-6">
                    A passionate developer who loves creating engaging and interactive web experiences.
                    QuantumFlip is a demonstration of combining modern web technologies with creative design.
                  </p>
                </AnimatedText>
                <AnimatedText delay={0.8}>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" size="sm">GitHub</Button>
                    <Button variant="outline" size="sm">Portfolio</Button>
                  </div>
                </AnimatedText>
              </motion.div>
            </div>
          </section>

          {/* Get Started Section */}
          <section className="min-h-screen flex items-center justify-center py-20 bg-muted/50">
            <div className="text-center">
              <AnimatedText>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Flip?</h2>
              </AnimatedText>
              <AnimatedText delay={0.2}>
                <p className="text-lg text-muted-foreground mb-8">
                  Start flipping coins and unlock amazing rewards!
                </p>
              </AnimatedText>
              <AnimatedText delay={0.4}>
                <Button
                  size="lg"
                  className="text-xl px-8 py-6"
                  onClick={() => setShowFlipper(true)}
                >
                  Get Started
                </Button>
              </AnimatedText>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-card rounded-lg p-6 shadow-lg h-full transform transition-transform duration-300 hover:scale-105">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
} 