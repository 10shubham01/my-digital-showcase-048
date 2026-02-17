import { motion } from "framer-motion";

const letterVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.3 + i * 0.04, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const AnimatedWord = ({ word, startIndex }: { word: string; startIndex: number }) => (
  <span className="inline-block overflow-hidden">
    {word.split("").map((char, i) => (
      <motion.span
        key={i}
        custom={startIndex + i}
        variants={letterVariants}
        initial="hidden"
        animate="visible"
        className="inline-block"
      >
        {char}
      </motion.span>
    ))}
  </span>
);

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-20 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-accent-secondary/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      <div className="max-w-5xl relative">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-sm font-body text-accent tracking-widest uppercase mb-6"
        >
          Full-Stack Developer
        </motion.p>

        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight text-foreground mb-8">
          <AnimatedWord word="SHUBHAM" startIndex={0} />
          <br />
          <span className="text-gradient-vivid">
            <AnimatedWord word="GUPTA" startIndex={7} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-base md:text-lg font-body text-muted-foreground max-w-xl leading-relaxed"
        >
          Building high-performing front-end applications with modern
          frameworks like React, Vue, and Next.js. Engineering the future, one pixel at a time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex gap-6 mt-10"
        >
          <motion.a
            href="#experience"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="text-sm font-body border border-accent/40 px-6 py-3 text-foreground hover:border-accent hover:bg-accent/5 transition-colors duration-300"
          >
            View Work
          </motion.a>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="text-sm font-body px-6 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors duration-300 glow-accent"
          >
            Contact
          </motion.a>
        </motion.div>
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
