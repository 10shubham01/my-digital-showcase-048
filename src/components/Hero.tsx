import { motion } from "framer-motion";
import Alien from "./Alien";

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      <div className="max-w-5xl relative">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-sm font-body text-muted-foreground tracking-widest uppercase mb-6"
        >
          Full-Stack Developer
        </motion.p>

        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-normal leading-[0.95] tracking-[0.15em] uppercase text-foreground mb-8 flex items-baseline gap-4 md:gap-6">
          <Alien text="Shubham" />
          <span className="font-display italic text-muted-foreground tracking-[0.05em] normal-case text-4xl md:text-6xl lg:text-7xl">
            <Alien text="Gupta" />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-base md:text-lg font-body text-muted-foreground max-w-xl leading-relaxed"
        >
          Building high-performing front-end applications with modern
          frameworks. Engineering the future, one pixel at a time.
        </motion.p>

      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-12 left-6 md:left-12"
      >
        <motion.p
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-xs font-body text-muted-foreground tracking-widest uppercase"
        >
          Scroll down ↓
        </motion.p>
      </motion.div>
    </section>
  );
};

export default Hero;
