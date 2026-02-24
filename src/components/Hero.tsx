import { motion } from "framer-motion";
import Alien from "./Alien";
import { useVisitorCount } from "@/hooks/useVisitorCount";

const Hero = () => {
  const currentYear = new Date().getFullYear();
  const yearsOfExperience = Math.floor(
    (Date.now() - new Date("2021-08-01").getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  );
  const visitorCount = useVisitorCount();

  return (
    <section className="min-h-screen flex flex-col justify-between px-6 md:px-12 lg:px-24 pl-12 md:pl-16 lg:pl-28 pt-28 pb-8 relative overflow-hidden">
      {/* Top: Role label + Open to Work badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative flex items-center gap-4"
      >
        <p className="text-xs font-mono text-muted-foreground tracking-[0.3em] uppercase">
          Full-Stack Developer — {currentYear}
        </p>
        <motion.span
          animate={{ boxShadow: ["0 0 0 0 hsl(152 69% 45% / 0.4)", "0 0 0 8px hsl(152 69% 45% / 0)", "0 0 0 0 hsl(152 69% 45% / 0)"] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center gap-1.5 bg-accent-green/10 border border-accent-green/30 text-accent-green text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          Open to Work
        </motion.span>
      </motion.div>

      {/* Center: Name - massive, full-width */}
      <div className="relative flex-1 flex items-center">
        <div className="w-full">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-[12vw] md:text-[10vw] lg:text-[9vw] font-normal leading-[0.85] tracking-[0.12em] uppercase text-foreground"
          >
            <Alien text="Shubham" />
            <span className="inline-block w-2 h-2 md:w-3 md:h-3 rounded-full bg-accent-pop ml-2 align-top" />
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-end justify-between mt-2"
          >
            <h1 className="font-display italic text-muted-foreground text-[8vw] md:text-[7vw] lg:text-[6vw] leading-[0.9] tracking-[0.02em]">
              <Alien text="Gupta" />
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="hidden md:block text-sm font-body text-muted-foreground max-w-xs text-right leading-relaxed"
            >
              Building high-performing applications with modern frameworks. One pixel at a time.
            </motion.p>
          </motion.div>

          {/* Divider line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-px bg-border mt-8 origin-left"
          />
        </div>
      </div>

      {/* Bottom: Scroll indicator + Hire Me CTA + stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="relative flex items-end justify-between"
      >
        <div className="flex items-end gap-6">
          <motion.p
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-xs font-mono text-muted-foreground tracking-widest uppercase"
          >
            Scroll ↓
          </motion.p>

          {/* Hire Me CTA */}
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex items-center gap-2 bg-accent-pop/10 hover:bg-accent-pop/20 border border-accent-pop/30 hover:border-accent-pop/50 text-accent-pop px-5 py-2.5 rounded-full font-mono text-xs tracking-widest uppercase transition-all duration-300"
          >
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-block"
            >
              →
            </motion.span>
            Hire Me
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-pop animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-pop" />
          </motion.a>
        </div>

        <div className="flex gap-12">
          {[
            { label: "Years Exp.", value: `${yearsOfExperience}+` },
            { label: "Projects", value: "10+" },
            { label: "Frameworks", value: "5+" },
            { label: "Visitors", value: visitorCount !== null ? visitorCount.toLocaleString() : "—" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4 + i * 0.1 }}
              className="text-right"
            >
              <p className="text-2xl md:text-3xl font-heading text-foreground tracking-wider">{stat.value}</p>
              <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Mobile description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="md:hidden text-sm font-body text-muted-foreground leading-relaxed mt-6"
      >
        Building high-performing applications with modern frameworks.
      </motion.p>
    </section>
  );
};

export default Hero;
