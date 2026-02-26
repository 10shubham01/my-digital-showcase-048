import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import SectionHeading from "./SectionHeading";
import Alien from "./Alien";
import TechIcons from "./TechIcons";

const skillColors: Record<string, string> = {
  TypeScript: "accent-blue",
  React: "accent-cyan",
  "Next.js": "accent-pop",
  "Vue.js": "accent-green",
  "Nuxt.js": "accent-green",
  "Node.js": "accent-orange",
  "Tailwind CSS": "accent-cyan",
  PostgreSQL: "accent-blue",
  AWS: "accent-orange",
  Git: "accent-pop",
};

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const yearsOfExperience = Math.floor(
    (Date.now() - new Date("2021-08-01").getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  );

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
    <section id="about" className="py-24 md:py-32 px-4 md:px-12 lg:px-24 pl-10 md:pl-16 lg:pl-28 relative">
      {/* Currently building ticker */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.8 }}
        className="absolute top-8 right-4 md:right-12 lg:right-24 flex items-center gap-2"
      >
        <motion.span
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-accent-orange"
        />
        <span className="text-[10px] font-mono text-accent-orange tracking-widest uppercase">
          Currently building: No-Code Platform
        </span>
      </motion.div>

      <SectionHeading title="About" number="01" />
      <div ref={ref} className="grid md:grid-cols-2 gap-12 md:gap-16 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="text-base font-body text-muted-foreground leading-relaxed mb-6">
            Senior Front-End Engineer with <span className="text-accent-cyan font-mono">{yearsOfExperience}+</span> years of hands-on experience
            architecting and shipping production-grade web applications at scale.
          </p>
          <p className="text-base font-body text-muted-foreground leading-relaxed mb-6">
            I lead front-end teams and drive technical decisions — from component architecture to 
            CI/CD pipelines. My focus is on building interfaces that are <span className="text-accent-pop">performant</span>, <span className="text-accent-blue">accessible</span>, and <span className="text-accent-green">delightful</span> to use.
          </p>
          <p className="text-base font-body text-muted-foreground leading-relaxed mb-8">
            Currently building a <span className="text-accent-orange">no-code platform</span> to democratize software development — 
            because great tools should empower everyone, not just engineers.
          </p>

          {/* Stats mini cards */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {[
              { value: "10+", label: "Projects", color: "accent-pop" },
              { value: "5+", label: "Frameworks", color: "accent-cyan" },
              { value: "99%", label: "Coffee Level", color: "accent-orange" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={`border border-border p-2 md:p-3 text-center hover:border-${stat.color}/30 hover:bg-${stat.color}/5 transition-all duration-300 group`}
              >
                <p className={`text-base md:text-lg font-heading text-${stat.color} tracking-wider`}>{stat.value}</p>
                <p className="text-[8px] md:text-[9px] font-mono text-muted-foreground tracking-widest uppercase mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
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
            {skills.map((skill) => {
              const IconComponent = TechIcons[skill];
              const color = skillColors[skill] || "accent-blue";
              return (
                <motion.span
                  key={skill}
                  variants={skillVariants}
                  whileHover={{ scale: 1.08, y: -2 }}
                  className={`text-xs md:text-sm font-body text-secondary-foreground bg-secondary px-2.5 md:px-3 py-1 md:py-1.5 border border-border cursor-default transition-all duration-300 hover:border-${color}/40 hover:bg-${color}/10 hover:text-${color} flex items-center gap-1.5 md:gap-2 group`}
                >
                  {IconComponent && (
                    <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                      <IconComponent />
                    </span>
                  )}
                  {skill}
                </motion.span>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
