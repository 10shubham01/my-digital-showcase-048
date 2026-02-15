import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const SectionHeading = ({ title, number }: { title: string; number: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="flex items-center gap-4 mb-12"
    >
      <span className="text-xs font-body text-accent tracking-widest">{number}</span>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="h-px flex-1 bg-accent/30 max-w-[60px] origin-left"
      />
      <h2 className="font-heading text-3xl md:text-4xl text-foreground">{title}</h2>
    </motion.div>
  );
};

export default SectionHeading;
