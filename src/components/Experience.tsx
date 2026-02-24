import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import SectionHeading from "./SectionHeading";
import Alien from "./Alien";

const experiences = [
  {
    role: "Founder / Builder",
    company: "No-Code Platform",
    period: "Present",
    description:
      "Building a no-code platform to democratize software development — enabling anyone to create full-stack applications without writing code.",
    tech: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
    accent: "accent-pop",
    projects: [],
  },
  {
    role: "Senior Software Engineer",
    company: "Credilio Financial Technologies",
    period: "Dec 2022 — Present",
    description:
      "Led a team of engineers, drove delivery of end-to-end credit card and personal loan journeys. Designed multiple AWS architectures from scratch.",
    tech: ["Next.js", "TypeScript", "AWS", "Remotion", "Tailwind CSS"],
    accent: "accent-blue",
    projects: [
      {
        title: "Bureau Wrap Video",
        description: "Next.js-based credit score visualization platform with Remotion video.",
        tech: ["Next.js", "Remotion", "AWS Lambda", "PostgreSQL"],
      },
      {
        title: "Customer Portal",
        description: "White-label customer-facing platform for credit card and personal loan journeys.",
        tech: ["React", "Next.js", "TypeScript", "Zod", "Redux"],
      },
      {
        title: "Advisor Portal",
        description: "White-label advisory platform supporting multi-tenant workflows.",
        tech: ["React", "Next.js", "TypeScript", "Vite"],
      },
    ],
  },
  {
    role: "Software Engineer",
    company: "MountBlue Technologies",
    period: "Aug 2021 — Nov 2022",
    description:
      "Built dynamic web applications using Vue.js, React.js, and Node.js. Migrated Nuxt 2 to Nuxt 3.",
    tech: ["Vue.js", "Nuxt.js", "Node.js", "PostgreSQL", "AdonisJS"],
    accent: "accent-cyan",
    projects: [
      {
        title: "Admin Portal",
        description: "Centralized admin system with role- and policy-driven authorization.",
        tech: ["Nuxt.js", "Vue.js", "TypeScript", "Pinia"],
      },
    ],
  },
];

const accentMap: Record<string, { border: string; bg: string; text: string; glow: string; dot: string }> = {
  "accent-pop": {
    border: "border-accent-pop/30",
    bg: "bg-accent-pop/5",
    text: "text-accent-pop",
    glow: "shadow-[0_0_30px_-8px_hsl(var(--accent-pop)/0.3)]",
    dot: "bg-accent-pop",
  },
  "accent-blue": {
    border: "border-accent-blue/30",
    bg: "bg-accent-blue/5",
    text: "text-accent-blue",
    glow: "shadow-[0_0_30px_-8px_hsl(var(--accent-blue)/0.3)]",
    dot: "bg-accent-blue",
  },
  "accent-cyan": {
    border: "border-accent-cyan/30",
    bg: "bg-accent-cyan/5",
    text: "text-accent-cyan",
    glow: "shadow-[0_0_30px_-8px_hsl(var(--accent-cyan)/0.3)]",
    dot: "bg-accent-cyan",
  },
};

const Experience = () => {
  const [active, setActive] = useState(0);

  return (
    <section id="experience" className="py-24 md:py-32 px-6 md:px-12 lg:px-24 pl-12 md:pl-16 lg:pl-28 relative">
      <SectionHeading title="Experience" number="02" />

      {/* Role selector tabs */}
      <div className="flex flex-wrap gap-3 mb-12">
        {experiences.map((exp, i) => {
          const colors = accentMap[exp.accent];
          return (
            <motion.button
              key={i}
              onClick={() => setActive(i)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`relative px-5 py-3 border font-mono text-xs tracking-widest uppercase transition-all duration-300 ${
                active === i
                  ? `${colors.border} ${colors.bg} ${colors.text} ${colors.glow}`
                  : "border-border text-muted-foreground hover:border-foreground/20"
              }`}
            >
              {active === i && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute inset-0 ${colors.bg} ${colors.border} border`}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{exp.company}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Active experience card */}
      <AnimatePresence mode="wait">
        <ExperienceCard key={active} exp={experiences[active]} />
      </AnimatePresence>
    </section>
  );
};

const ExperienceCard = ({ exp }: { exp: (typeof experiences)[0] }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const colors = accentMap[exp.accent];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-5xl"
    >
      {/* Main info */}
      <div className={`border ${colors.border} ${colors.bg} p-8 md:p-10 relative overflow-hidden`}>
        {/* Accent corner */}
        <div className={`absolute top-0 right-0 w-24 h-24 ${colors.bg} opacity-50`} style={{
          clipPath: "polygon(100% 0, 0 0, 100% 100%)"
        }} />
        <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${colors.dot}`} />

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading text-2xl md:text-3xl text-foreground tracking-wide uppercase"
            >
              <Alien text={exp.role} />
            </motion.h3>
            <p className={`text-sm font-mono ${colors.text} mt-1`}>{exp.company}</p>
          </div>
          <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase whitespace-nowrap border border-border px-3 py-1.5 self-start">
            {exp.period}
          </span>
        </div>

        <p className="text-sm font-body text-muted-foreground leading-relaxed mb-6 max-w-2xl">
          {exp.description}
        </p>

        {/* Tech stack as colored pills */}
        <div className="flex flex-wrap gap-2">
          {exp.tech.map((t) => (
            <motion.span
              key={t}
              whileHover={{ scale: 1.08 }}
              className={`text-[11px] font-mono ${colors.text} ${colors.bg} border ${colors.border} px-3 py-1 tracking-wider uppercase cursor-default transition-all duration-200`}
            >
              {t}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Projects grid */}
      {exp.projects.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {exp.projects.map((project, pi) => (
            <motion.div
              key={pi}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + pi * 0.1 }}
              onMouseEnter={() => setHoveredProject(pi)}
              onMouseLeave={() => setHoveredProject(null)}
              className={`border p-5 transition-all duration-300 cursor-default group ${
                hoveredProject === pi
                  ? `${colors.border} ${colors.bg} ${colors.glow}`
                  : "border-border hover:border-foreground/15"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-1.5 h-1.5 rounded-full ${hoveredProject === pi ? colors.dot : "bg-muted-foreground/30"} transition-colors`} />
                <h4 className="font-heading text-sm text-foreground tracking-wider uppercase">
                  {project.title}
                </h4>
              </div>
              <p className="text-xs font-body text-muted-foreground leading-relaxed mb-3">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.tech.map((t) => (
                  <span key={t} className="text-[10px] font-mono text-muted-foreground/60 tracking-wider">{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Experience;