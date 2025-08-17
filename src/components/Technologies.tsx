"use client";

import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import { useInview } from "../lib/animateInscroll";
import { useLanguage } from "@/hooks/LanguageContext";
import { getTranslation } from "@//utils/translations";

interface Technology {
  href: string;
  icon: string;
  name: string;
  category: 'framework' | 'language' | 'tool' | 'backend' | 'devops';
}

function useSpinCarousel({
  totalItems,
  spinRounds = 3,
  duration = 3500,
  onSpinStart,
  onSpinEnd,
}: {
  totalItems: number;
  spinRounds?: number;
  duration?: number;
  onSpinStart?: () => void;
  onSpinEnd?: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startIndexRef = useRef<number>(0);

  const cleanupSpin = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startTimeRef.current = null;
    startIndexRef.current = 0;
  };

  const spin = () => {
    if (isSpinning || rafRef.current !== null) return;

    setIsSpinning(true);
    startIndexRef.current = currentIndex;
    startTimeRef.current = performance.now();
    onSpinStart?.();

    const animate = (time: number) => {
      if (!startTimeRef.current) return;

      const elapsed = time - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 5);
      const floatIndex = startIndexRef.current + easedProgress * spinRounds * totalItems;
      const newIndex = Math.floor(floatIndex) % totalItems;

      setCurrentIndex(newIndex < 0 ? newIndex + totalItems : newIndex);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        cleanupSpin();
        setIsSpinning(false);
        onSpinEnd?.();
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return cleanupSpin;
  }, []);

  return {
    currentIndex,
    isSpinning,
    spin,
    setCurrentIndex,
    cleanupSpin,
  };
}

export default function Technologies() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInview(ref);
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);

  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('techCategory') || 'all';
    }
    return 'all';
  });

  useEffect(() => {
    const saved = localStorage.getItem("techCarouselIndex");
    setSavedIndex(saved ? parseInt(saved, 10) : 0);
  }, []);

  const technologies = useMemo<Technology[]>(() => [
    { href: "https://nextjs.org", icon: "simple-icons:nextdotjs", name: "Next.js", category: "framework" },
    { href: "https://astro.build", icon: "simple-icons:astro", name: "Astro", category: "framework" },
    { href: "https://reactjs.org", icon: "simple-icons:react", name: "React", category: "framework" },
    { href: "https://www.typescriptlang.org", icon: "simple-icons:typescript", name: "TypeScript", category: "language" },
    { href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", icon: "simple-icons:javascript", name: "JavaScript", category: "language" },
    { href: "https://www.php.net", icon: "simple-icons:php", name: "PHP", category: "language" },
    { href: "https://golang.org", icon: "simple-icons:go", name: "Golang", category: "language" },
    { href: "https://www.gnu.org/software/bash/", icon: "simple-icons:gnubash", name: "Bash", category: "tool" },
    { href: "https://www.python.org", icon: "simple-icons:python", name: "Python", category: "language" },
    { href: "https://pnpm.io", icon: "simple-icons:pnpm", name: "pnpm", category: "tool" },
    { href: "https://www.kernel.org", icon: "teenyicons:linux-alt-solid", name: "Linux", category: "devops" },
    { href: "https://www.markdownguide.org", icon: "simple-icons:markdown", name: "Markdown", category: "tool" },
    { href: "https://css-tricks.com", icon: "simple-icons:css3", name: "CSS", category: "language" },
    { href: "https://nodejs.org", icon: "simple-icons:nodedotjs", name: "Node.js", category: "backend" },
    { href: "https://www.docker.com", icon: "simple-icons:docker", name: "Docker", category: "devops" },
  ], []);

  const filteredTechs = activeCategory === 'all'
    ? technologies
    : technologies.filter(tech => tech.category === activeCategory);

  const totalItems = filteredTechs.length;

  const {
    currentIndex,
    isSpinning,
    spin,
    setCurrentIndex,
    cleanupSpin,
  } = useSpinCarousel({
    totalItems,
    duration: 3500,
    onSpinEnd: () => {
      if (isInView) setAutoScrollEnabled(true);
    },
    onSpinStart: () => setAutoScrollEnabled(false),
  });

  useEffect(() => {
    if (savedIndex !== null) {
      setCurrentIndex(savedIndex);
    }
  }, [savedIndex, setCurrentIndex]);

  useEffect(() => {
    localStorage.setItem("techCarouselIndex", currentIndex.toString());
  }, [currentIndex]);

  useEffect(() => {
    localStorage.setItem('techCategory', activeCategory);
  }, [activeCategory]);

  const [isInitialAnimationDone, setIsInitialAnimationDone] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);

  useEffect(() => {
    if (isInView && !isInitialAnimationDone) {
      const timer = setTimeout(() => setIsInitialAnimationDone(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, isInitialAnimationDone]);

  useEffect(() => {
    if (isInView && isInitialAnimationDone && !isSpinning && autoScrollEnabled) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalItems);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isInView, isInitialAnimationDone, isSpinning, autoScrollEnabled, totalItems, setCurrentIndex]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setAutoScrollEnabled(false);
        cleanupSpin();
      } else if (isInView) {
        setAutoScrollEnabled(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isInView, cleanupSpin]);

  const [supportsHover] = useState(() => {
    return typeof window !== 'undefined'
      ? window.matchMedia('(hover: hover)').matches
      : true;
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>, position: number) => {
    if (!supportsHover || isSpinning) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    let scale = 1.1, tx = 0, ty = 0;

    if (position === 0) {
      scale = 1.1; tx = 0; ty = 0;
    } else if (Math.abs(position) === 1) {
      scale = 1.05; tx = x * 0.5; ty = y * 0.5;
    } else {
      return;
    }

    e.currentTarget.style.transform = `rotateX(${ty}deg) rotateY(${tx}deg) scale(${scale})`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!supportsHover || isSpinning) return;
    e.currentTarget.style.transform = "";
  };

  const [touchStart, setTouchStart] = useState<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isSpinning || !touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentIndex((prev) => (prev + 1) % totalItems);
      } else {
        setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
      }
      setAutoScrollEnabled(false);
    }
    setTouchStart(0);
  };

  const getVisibleIndicators = () => {
    const indices = [];
    for (let i = -2; i <= 2; i++) {
      indices.push((currentIndex + i + totalItems) % totalItems);
    }
    return indices;
  };
  const visibleIndicators = getVisibleIndicators();

  const visibleTechs = useMemo(() => {
    const totalToShow = 5;
    const visible = [];
    for (let i = 0; i < totalToShow; i++) {
      const offset = i - Math.floor(totalToShow / 2);
      const displayIndex = (currentIndex + offset + totalItems) % totalItems;
      const tech = filteredTechs[displayIndex];
      if (tech) {
        visible.push({ ...tech, position: offset });
      }
    }
    return visible;
  }, [currentIndex, filteredTechs, totalItems]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: isInitialAnimationDone ? {
      opacity: 1,
      transition: { staggerChildren: 0.1, when: "beforeChildren" }
    } : {}
  };

  const itemVariants = {
    hidden: { opacity: 0, x: (i: number) => (i - 2.5) * -50, rotateY: -45 },
    visible: { opacity: 1, x: 0, rotateY: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, filter: "blur(4px)", x: (i: number) => (i - 2.5) * 50, rotateY: 45 }
  };

  return (
    <div id="technologies" className="flex justify-center items-center mt-10" ref={ref}>
      <div className="flex flex-col items-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 1.1, ease: [0.22, 0.03, 0.26, 1], opacity: { duration: 1.3 } }}
        >
          <h2 className="text-2xl font-bold text-white/90 text-center">{t("technologies.title")}</h2>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mt-4 mb-6">
          {[
            { id: 'all', label: t('technologies.categories.all', 'All') },
            { id: 'language', label: t('technologies.categories.language', 'Languages') },
            { id: 'framework', label: t('technologies.categories.framework', 'Frameworks') },
            { id: 'tool', label: t('technologies.categories.tool', 'Tools') },
            { id: 'backend', label: t('technologies.categories.backend', 'Backend') },
            { id: 'devops', label: t('technologies.categories.devops', 'DevOps') },
          ].map(({ id, label }) => (
            <motion.button
              key={id}
              onClick={() => {
                setActiveCategory(id);
                setCurrentIndex(0);
                setAutoScrollEnabled(false);
                setTimeout(() => setAutoScrollEnabled(true), 100);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === id
                  ? "bg-white text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-pressed={activeCategory === id}
            >
              {label}
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 1.2, ease: [0.22, 0.03, 0.26, 1], delay: 0.15 }}
          className="relative w-full max-w-4xl"
        >
          <Card className="bg-black/5 relative mx-4 mt-3 w-auto max-w-4xl overflow-hidden backdrop-blur-[1px] py-0.5 border border-[#999a9e]/75 rounded-xl transition-all duration-300 ease-in-out hover:shadow-[0_0_10px_rgba(35,32,32,15)] hover:border-opacity-60">
            <video className="absolute inset-0 w-full h-full object-cover opacity-35 -z-10" autoPlay loop muted playsInline>
              <source src="/assets/card.mp4" type="video/mp4" />
            </video>
            <CardBody className="overflow-visible px-0 py-8">
              <div className="pointer-events-none absolute inset-0" style={{ zIndex: 0 }}></div>

              <motion.button
                onClick={spin}
                disabled={isSpinning}
                aria-label="Spin the technology carousel"
                className="absolute left-1/2 transform -translate-x-1/2 -top-8 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full px-4 py-1 text-sm transition-all duration-300 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                {isSpinning ? t("technologies.spinning") : t("technologies.spin")}
              </motion.button>

              <motion.button
                onClick={() => {
                  setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
                  setAutoScrollEnabled(false);
                }}
                disabled={isSpinning}
                aria-label="Go to previous technology"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl transition-all duration-300 disabled:opacity-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                ‹
              </motion.button>

              <motion.div
                className="flex justify-center items-center h-24 relative"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <AnimatePresence mode="popLayout">
                  {visibleTechs.map((tech, index) => {
                    const distance = Math.abs(tech.position);
                    const scale = 1 - distance * 0.15;
                    const opacity = 1 - distance * 0.3;
                    const zIndex = 10 - distance;
                    const blur = supportsHover ? `${distance * 1.2}px` : "0px";
                    const rotateY = tech.position * 15;

                    return (
                      <motion.a
                        {/* --- CORRECCIÓN 1: Usar tech.name como key en lugar de una combinación compleja --- */}
                        key={tech.name}
                        href={tech.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute flex items-center justify-center"
                        style={{
                          zIndex,
                          transform: `translateX(${tech.position * 120}px) scale(${scale}) rotateY(${rotateY}deg)`,
                          filter: `blur(${blur})`,
                          opacity,
                        }}
                        onMouseMove={(e) => handleMouseMove(e, tech.position)}
                        onMouseLeave={handleMouseLeave}
                        whileHover={{ zIndex: 20 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                          layout: { duration: 0.4, ease: tech.position > 0 ? [0.34, 1.56, 0.64, 1] : [0.34, 0.26, 0.64, 1.26] }
                        }}
                        aria-label={`Learn more about ${tech.name}`}
                      >
                        <motion.div
                          className="border-[#aaabaf]/50 flex flex-col items-center gap-2 rounded-lg border px-4 py-3 whitespace-nowrap bg-black/80 text-white backdrop-blur-sm"
                          style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)", transformStyle: "preserve-3d", willChange: "transform" }}
                          animate={isSpinning ? { rotateY: [0, 90, 180, 270, 360] } : {}}
                          transition={isSpinning ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" } : { type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <Icon icon={tech.icon} className="h-8 w-8 text-[#b7b7b7]" aria-hidden="true" />
                          <span className="text-gray-300 text-sm font-medium">{tech.name}</span>
                        </motion.div>
                      </motion.a>
                    );
                  })}
                </AnimatePresence>
              </motion.div>

              <motion.button
                onClick={() => {
                  setCurrentIndex((prev) => (prev + 1) % totalItems);
                  setAutoScrollEnabled(false);
                }}
                disabled={isSpinning}
                aria-label="Go to next technology"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl transition-all duration-300 disabled:opacity-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                ›
              </motion.button>

              {/* --- CORRECCIÓN 2: Usar loopIndex como key en lugar del valor idx --- */}
              <div className="flex justify-center mt-6 space-x-1">
                {visibleIndicators.map((idx, loopIndex) => (
                  <motion.div
                    key={loopIndex}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? "bg-white w-6" : "bg-white/30"
                    }`}
                    animate={{ opacity: idx === currentIndex ? 1 : 0.6 }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}