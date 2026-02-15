import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import SectionHeading from "./SectionHeading";

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-card">
      <SectionHeading title="Get in Touch" number="04" />
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-2xl"
      >
        <p className="text-base font-body text-muted-foreground leading-relaxed mb-10">
          Let's work together to bring your ideas to life. I'm always excited to
          take on new challenges and create something amazing.
        </p>
        <a
          href="mailto:shubhamedu.01@gmail.com"
          className="inline-block text-lg font-heading text-foreground border-b border-border pb-1 hover:border-foreground transition-colors duration-300"
        >
          shubhamedu.01@gmail.com
        </a>
        <div className="flex gap-6 mt-8">
          <a
            href="https://github.com/10shubham01"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/10shubham01"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            LinkedIn
          </a>
        </div>
      </motion.div>

      <div className="mt-24 pt-8 border-t border-border">
        <p className="text-xs font-body text-muted-foreground">
          © {new Date().getFullYear()} Shubham Gupta. All rights reserved.
        </p>
      </div>
    </section>
  );
};

export default Contact;
