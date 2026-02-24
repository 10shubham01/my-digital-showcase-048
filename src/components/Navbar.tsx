import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-5 left-8 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-5 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <motion.a
        href="#"
        whileHover={{ scale: 1.05 }}
        className="font-heading text-lg tracking-[0.2em] uppercase text-foreground"
      >
        SG.
      </motion.a>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <motion.a
          href="#contact"
          whileHover={{ scale: 1.03 }}
          className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors duration-300"
        >
          Get in touch
        </motion.a>
      </div>
    </motion.nav>
  );
};

export default Navbar;
