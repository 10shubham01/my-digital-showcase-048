import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"geo" | "reveal" | "exit">("geo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 1600);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (phase === "reveal") {
      const t = setTimeout(() => setPhase("exit"), 900);
      return () => clearTimeout(t);
    }
    if (phase === "exit") {
      const t = setTimeout(onComplete, 700);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  const shapes = [
    // Rotating square
    { delay: 0, element: (
      <motion.div
        initial={{ rotate: 0, scale: 0, opacity: 0 }}
        animate={{ rotate: 180, scale: 1, opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], times: [0, 0.3, 0.7, 1] }}
        className="absolute w-24 h-24 md:w-32 md:h-32 border border-background/20"
        style={{ top: "20%", left: "15%" }}
      />
    )},
    // Circle
    { delay: 0.1, element: (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.3, delay: 0.1, ease: [0.22, 1, 0.36, 1], times: [0, 0.4, 0.7, 1] }}
        className="absolute w-20 h-20 md:w-28 md:h-28 rounded-full border border-background/15"
        style={{ bottom: "25%", right: "18%" }}
      />
    )},
    // Triangle (CSS)
    { delay: 0.2, element: (
      <motion.div
        initial={{ y: 40, opacity: 0, rotate: -30 }}
        animate={{ y: 0, opacity: [0, 0.8, 0.8, 0], rotate: 30 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1], times: [0, 0.3, 0.7, 1] }}
        className="absolute"
        style={{
          top: "30%",
          right: "28%",
          width: 0,
          height: 0,
          borderLeft: "30px solid transparent",
          borderRight: "30px solid transparent",
          borderBottom: "52px solid hsl(var(--background) / 0.12)",
        }}
      />
    )},
    // Small square
    { delay: 0.15, element: (
      <motion.div
        initial={{ rotate: 45, scale: 0, opacity: 0 }}
        animate={{ rotate: 135, scale: 1, opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.2, delay: 0.15, ease: [0.22, 1, 0.36, 1], times: [0, 0.35, 0.65, 1] }}
        className="absolute w-10 h-10 md:w-14 md:h-14 border border-background/10"
        style={{ bottom: "35%", left: "25%" }}
      />
    )},
    // Dot
    { delay: 0.3, element: (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1, 0] }}
        transition={{ duration: 1, delay: 0.3, ease: "easeInOut" }}
        className="absolute w-3 h-3 rounded-full bg-background/20"
        style={{ top: "45%", left: "45%" }}
      />
    )},
    // Horizontal line
    { delay: 0.05, element: (
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: [0, 1, 1, 0] }}
        transition={{ duration: 1.4, delay: 0.05, ease: [0.22, 1, 0.36, 1], times: [0, 0.4, 0.7, 1] }}
        className="absolute h-px w-40 md:w-64 bg-background/10 origin-left"
        style={{ top: "55%", left: "10%" }}
      />
    )},
    // Vertical line
    { delay: 0.25, element: (
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: [0, 1, 1, 0] }}
        transition={{ duration: 1.2, delay: 0.25, ease: [0.22, 1, 0.36, 1], times: [0, 0.4, 0.7, 1] }}
        className="absolute w-px h-32 md:h-48 bg-background/10 origin-top"
        style={{ top: "15%", right: "35%" }}
      />
    )},
  ];

  const nameLines = ["SHUBHAM", "GUPTA"];

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          key="preloader"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-foreground overflow-hidden"
        >
          {/* Geometry phase */}
          {phase === "geo" && (
            <>
              {shapes.map((s, i) => (
                <div key={i}>{s.element}</div>
              ))}

              {/* Center crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.4, 0] }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                  className="relative w-16 h-16"
                >
                  <div className="absolute top-1/2 left-0 w-full h-px bg-background/20" />
                  <div className="absolute left-1/2 top-0 h-full w-px bg-background/20" />
                </motion.div>
              </div>

              {/* Corner labels */}
              <div className="fixed top-6 left-6 text-[10px] font-mono text-background/20 tracking-widest">
                SG.DEV
              </div>
              <div className="fixed bottom-6 right-6 text-[10px] font-mono text-background/20 tracking-widest">
                {new Date().getFullYear()}
              </div>
            </>
          )}

          {/* Reveal phase */}
          {phase === "reveal" && (
            <div className="relative text-center">
              {nameLines.map((line, i) => (
                <div key={line} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.12,
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

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="h-px bg-background/20 mt-4 origin-center"
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="text-[10px] font-mono text-background/30 tracking-[0.5em] uppercase mt-3"
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
