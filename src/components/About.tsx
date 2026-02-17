import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import SectionHeading from "./SectionHeading";
import Alien from "./Alien";

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const skills = [
    "TypeScript", "React", "Next.js", "Vue.js", "Nuxt.js",
    "Node.js", "Tailwind CSS", "PostgreSQL", "AWS", "Git",
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.05, delayChildren: 0.3 },
    },
  };

  const skillVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300 } },
  };

  return (
    <section id="about" className="py-24 md:py-32 px-6 md:px-12 lg:px-24">
      <SectionHeading title="About" number="01" />
      <div ref={ref} className="grid md:grid-cols-2 gap-16 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="text-base font-body text-muted-foreground leading-relaxed mb-6">
            Experienced Software Engineer with a solid foundation in full-stack development.
            For the past 3+ years, I've been engineering high-performing front-end applications
            and crafting seamless user experiences with modern frameworks.
          </p>
          <p className="text-base font-body text-muted-foreground leading-relaxed">
            I specialize in building interfaces that are fast, scalable, and user-friendly —
            the kind that turn ideas into polished products.
          </p>
        </motion.div>
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-xs font-body text-muted-foreground tracking-widest uppercase mb-6"
          >
            <Alien text="Technologies" />
          </motion.p>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="flex flex-wrap gap-2"
          >
            {skills.map((skill) => (
              <motion.span
                key={skill}
                variants={skillVariants}
                whileHover={{ scale: 1.1 }}
                className="text-sm font-body text-secondary-foreground bg-secondary px-3 py-1.5 border border-border cursor-default transition-colors hover:bg-foreground hover:text-background"
              >
                {skill}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
