import { motion } from "framer-motion";

const MarqueeFooter = () => {
  const line1 = "FRONTEND DEVELOPER • FULL-STACK ENGINEER • UI/UX ENTHUSIAST • ";
  const line2 = "REACT • VUE • NEXT.JS • TYPESCRIPT • NODE.JS • AWS • ";
  const repeated1 = line1.repeat(4);
  const repeated2 = line2.repeat(4);

  return (
    <footer className="relative min-h-[60vh] flex flex-col justify-center overflow-hidden border-t border-border bg-background">
      {/* Scrolling lines */}
      <div className="space-y-6 py-16">
        <motion.div
          animate={{ x: [0, -2400] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap"
        >
          <span className="font-display italic text-6xl md:text-8xl lg:text-9xl text-foreground/[0.06] tracking-tight">
            {repeated1}
          </span>
        </motion.div>

        <motion.div
          animate={{ x: [-2400, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap"
        >
          <span className="font-heading text-5xl md:text-7xl lg:text-8xl text-foreground/[0.04] tracking-[0.2em] uppercase">
            {repeated2}
          </span>
        </motion.div>

        <motion.div
          animate={{ x: [0, -2000] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap"
        >
          <span className="font-display italic text-6xl md:text-8xl lg:text-9xl text-foreground/[0.06] tracking-tight">
            {repeated1}
          </span>
        </motion.div>
      </div>

      {/* Footer bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 py-6 border-t border-border">
        <p className="text-xs font-body text-muted-foreground">
          © {new Date().getFullYear()} Shubham Gupta
        </p>
      </div>
    </footer>
  );
};

export default MarqueeFooter;
