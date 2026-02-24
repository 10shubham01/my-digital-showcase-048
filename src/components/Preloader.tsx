import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [counter, setCounter] = useState(0);
  const [phase, setPhase] = useState<"counting" | "reveal" | "exit">("counting");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let current = 0;
    const speeds = [
      { threshold: 30, delay: 60 },
      { threshold: 60, delay: 40 },
      { threshold: 85, delay: 30 },
      { threshold: 95, delay: 80 },
      { threshold: 100, delay: 120 },
    ];

    const tick = () => {
      current++;
      setCounter(current);

      if (current >= 100) {
        setTimeout(() => setPhase("reveal"), 300);
        return;
      }

      const speed = speeds.find((s) => current < s.threshold) || speeds[speeds.length - 1];
      intervalRef.current = setTimeout(tick, speed.delay);
    };

    intervalRef.current = setTimeout(tick, 200);
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === "reveal") {
      const timer = setTimeout(() => setPhase("exit"), 1200);
      return () => clearTimeout(timer);
    }
    if (phase === "exit") {
      const timer = setTimeout(onComplete, 800);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  const nameLines = ["SHUBHAM", "GUPTA"];

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          key="preloader"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-foreground overflow-hidden"
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--background) / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--background) / 0.5) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />

          {/* Horizontal scan line */}
          <motion.div
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-px bg-background/10"
          />

          {/* Counter phase */}
          {phase === "counting" && (
            <div className="relative">
              {/* Large counter */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <span
                  className="font-heading text-[28vw] md:text-[20vw] leading-none tracking-[0.05em] text-background tabular-nums"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {String(counter).padStart(3, "0")}
                </span>
              </motion.div>

              {/* Progress bar */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-px bg-background/10">
                <motion.div
                  className="h-full bg-background/40"
                  style={{ width: `${counter}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              {/* Status text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-[10px] font-mono text-background/30 tracking-[0.4em] uppercase whitespace-nowrap"
              >
                {counter < 30
                  ? "initializing"
                  : counter < 60
                  ? "loading modules"
                  : counter < 90
                  ? "compiling"
                  : "ready"}
              </motion.p>

              {/* Corner decorations */}
              <div className="fixed top-6 left-6 text-[10px] font-mono text-background/20 tracking-widest">
                SG.DEV
              </div>
              <div className="fixed top-6 right-6 text-[10px] font-mono text-background/20 tracking-widest">
                {new Date().getFullYear()}
              </div>
              <div className="fixed bottom-6 left-6 text-[10px] font-mono text-background/20 tracking-widest">
                v1.0.0
              </div>
              <div className="fixed bottom-6 right-6 text-[10px] font-mono text-background/20 tracking-widest">
                PORTFOLIO
              </div>
            </div>
          )}

          {/* Reveal phase - name split */}
          {phase === "reveal" && (
            <div className="relative text-center">
              {nameLines.map((line, i) => (
                <div key={line} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.15,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <span
                      className={`block font-heading tracking-[0.15em] ${
                        i === 0
                          ? "text-[16vw] md:text-[12vw] text-background leading-[0.9]"
                          : "text-[10vw] md:text-[8vw] text-background/40 leading-[0.95]"
                      }`}
                      style={{
                        fontFamily: i === 1 ? "var(--font-display)" : undefined,
                        fontStyle: i === 1 ? "italic" : undefined,
                      }}
                    >
                      {line}
                    </span>
                  </motion.div>
                </div>
              ))}

              {/* Horizontal line under name */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="h-px bg-background/20 mt-6 origin-center"
              />

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-[10px] font-mono text-background/30 tracking-[0.5em] uppercase mt-4"
              >
                Full-Stack Developer
              </motion.p>
            </div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default Preloader;
