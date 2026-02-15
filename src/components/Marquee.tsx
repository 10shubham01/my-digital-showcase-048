import { motion } from "framer-motion";

const Marquee = () => {
  const text = "FRONTEND DEVELOPER • FULL-STACK ENGINEER • UI/UX ENTHUSIAST • ";
  const repeated = text.repeat(4);

  return (
    <div className="py-12 overflow-hidden border-y border-border bg-card/50">
      <motion.div
        animate={{ x: [0, -2000] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap"
      >
        <span className="font-heading text-5xl md:text-7xl text-foreground/10 tracking-tight">
          {repeated}
        </span>
      </motion.div>
    </div>
  );
};

export default Marquee;
