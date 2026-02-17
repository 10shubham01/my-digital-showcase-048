import { motion } from "framer-motion";

const links = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

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
        className="font-heading text-lg tracking-tight text-foreground"
      >
        SG<span className="text-accent">.</span>
      </motion.a>

      <div className="hidden md:flex items-center gap-8">
        {links.map((link) => (
          <motion.a
            key={link.label}
            href={link.href}
            whileHover={{ color: "hsl(185, 80%, 50%)" }}
            className="text-xs font-body text-muted-foreground tracking-widest uppercase transition-colors duration-300"
          >
            {link.label}
          </motion.a>
        ))}
      </div>

      <motion.a
        href="#contact"
        whileHover={{ scale: 1.03 }}
        className="text-sm font-body text-accent hover:text-foreground transition-colors duration-300"
      >
        Get in touch
      </motion.a>
    </motion.nav>
  );
};

export default Navbar;
