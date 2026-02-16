import { motion } from "framer-motion";
import { useState } from "react";

const links = [
{ label: "About", href: "#about" },
{ label: "Experience", href: "#experience" },
{ label: "Projects", href: "#projects" },
{ label: "Contact", href: "#contact" }];


const Navbar = () => {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-background/80 backdrop-blur-md border-b border-border">

      <motion.a
        href="#"
        whileHover={{ scale: 1.05 }}
        className="font-heading text-lg tracking-tight text-foreground">

        SG<span className="text-accent">.</span>
      </motion.a>

      




















      <motion.a
        href="mailto:shubhamedu.01@gmail.com"
        whileHover={{ scale: 1.03 }}
        className="text-sm font-body text-accent hover:text-foreground transition-colors duration-300">

        Get in touch
      </motion.a>
    </motion.nav>);

};

export default Navbar;