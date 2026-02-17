import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <motion.a
        href="#"
        whileHover={{ scale: 1.05 }}
        className="font-heading text-lg tracking-[0.2em] uppercase text-foreground"
      >
        SG.
      </motion.a>

      <motion.a
        href="#contact"
        whileHover={{ scale: 1.03 }}
        className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors duration-300"
      >
        Get in touch
      </motion.a>
    </motion.nav>
  );
};

export default Navbar;
