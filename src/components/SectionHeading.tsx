import { motion } from "framer-motion";
import { useInView } from "framer-motion";
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
      <span className="text-xs font-body text-muted-foreground tracking-widest">{number}</span>
      <div className="h-px flex-1 bg-border max-w-[60px]" />
      <h2 className="font-heading text-3xl md:text-4xl text-foreground">{title}</h2>
    </motion.div>
  );
};

export default SectionHeading;
