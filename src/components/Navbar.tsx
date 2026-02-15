import { motion } from "framer-motion";

const Navbar = () => {
  const links = [
    { label: "About", href: "#about" },
    { label: "Experience", href: "#experience" },
    { label: "Projects", href: "#projects" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <a href="#" className="font-heading text-lg tracking-tight text-foreground">
        SG
      </a>
      <div className="hidden md:flex items-center gap-8">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            {link.label}
          </a>
        ))}
      </div>
      <a
        href="mailto:shubhamedu.01@gmail.com"
        className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors duration-300"
      >
        Get in touch
      </a>
    </motion.nav>
  );
};

export default Navbar;
