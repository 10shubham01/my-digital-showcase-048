import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import SectionHeading from "./SectionHeading";

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const linkVariants = {
    hover: { x: 4, color: "hsl(25, 80%, 55%)" },
  };

  return (
    <section id="contact" className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-card relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <SectionHeading title="Get in Touch" number="04" />
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-2xl relative"
      >
        <p className="text-base font-body text-muted-foreground leading-relaxed mb-10">
          Let's work together to bring your ideas to life. I'm always excited to
          take on new challenges and create something amazing.
        </p>
        <motion.a
          href="mailto:shubhamedu.01@gmail.com"
          whileHover={{ scale: 1.01 }}
          className="inline-block text-lg md:text-2xl font-heading text-foreground border-b border-accent/40 pb-1 hover:border-accent transition-colors duration-300"
        >
          shubhamedu.01@gmail.com
        </motion.a>
        <div className="flex gap-6 mt-8">
          {[
            { label: "GitHub", href: "https://github.com/10shubham01" },
            { label: "LinkedIn", href: "https://www.linkedin.com/in/10shubham01" },
          ].map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              variants={linkVariants}
              whileHover="hover"
              className="text-sm font-body text-muted-foreground transition-colors duration-300 flex items-center gap-1"
            >
              {link.label} →
            </motion.a>
          ))}
        </div>
      </motion.div>

      <div className="mt-24 pt-8 border-t border-border relative">
        <p className="text-xs font-body text-muted-foreground">
          © {new Date().getFullYear()} Shubham Gupta. All rights reserved.
        </p>
      </div>
    </section>
  );
};

export default Contact;
