import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-20">
      <div className="max-w-5xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm font-body text-muted-foreground tracking-widest uppercase mb-6"
        >
          Full-Stack Developer
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-heading text-5xl md:text-7xl lg:text-8xl font-normal leading-[0.95] tracking-tight text-foreground mb-8"
        >
          Shubham
          <br />
          <span className="italic text-gradient">Gupta</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-base md:text-lg font-body text-muted-foreground max-w-xl leading-relaxed"
        >
          I specialize in creating innovative, user-centered products that stand
          out. Building high-performing front-end applications with modern
          frameworks like React, Vue, and Next.js.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex gap-6 mt-10"
        >
          <a
            href="#projects"
            className="text-sm font-body border border-border px-6 py-3 text-foreground hover:bg-secondary transition-colors duration-300"
          >
            View Work
          </a>
          <a
            href="#contact"
            className="text-sm font-body px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300"
          >
            Contact
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-12 left-6 md:left-12"
      >
        <p className="text-xs font-body text-muted-foreground tracking-widest uppercase rotate-0">
          Scroll down ↓
        </p>
      </motion.div>
    </section>
  );
};

export default Hero;
