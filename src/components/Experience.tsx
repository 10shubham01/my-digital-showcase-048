import { motion, useInView } from "framer-motion";
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
    projects: [],
  },
  {
    role: "Senior Software Engineer / Lead Developer",
    company: "Credilio Financial Technologies",
    period: "Dec 2022 — Present",
    description:
      "Led a team of engineers, drove delivery of end-to-end credit card and personal loan journeys. Designed multiple AWS architectures from scratch. Integrated observability with New Relic and attribution tracking with Singular.",
    tech: ["Next.js", "TypeScript", "AWS", "Remotion", "Tailwind CSS"],
    projects: [
      {
        title: "Bureau Wrap Video",
        description: "Next.js-based credit score visualization platform with Remotion video. Automated personalized credit score presentations.",
        tech: ["Next.js", "Remotion", "AWS Lambda", "PostgreSQL"],
      },
      {
        title: "Customer Portal",
        description: "White-label customer-facing platform for credit card and personal loan journeys with composable components.",
        tech: ["React", "Next.js", "TypeScript", "Zod", "Redux"],
      },
      {
        title: "Advisor Portal",
        description: "White-label advisory platform supporting multi-tenant workflows with accessible form infrastructure.",
        tech: ["React", "Next.js", "TypeScript", "Vite"],
      },
    ],
  },
  {
    role: "Software Engineer / Consultant",
    company: "MountBlue Technologies",
    period: "Aug 2021 — Nov 2022",
    description:
      "Built dynamic web applications using Vue.js, React.js, and Node.js. Delivered robust APIs and database connections with Express.js and PostgreSQL. Migrated Nuxt 2 to Nuxt 3.",
    tech: ["Vue.js", "Nuxt.js", "Node.js", "PostgreSQL", "AdonisJS"],
    projects: [
      {
        title: "Admin Portal",
        description: "Centralized administrative system with role- and policy-driven authorization layer for secure access across white-label workflows.",
        tech: ["Nuxt.js", "Vue.js", "TypeScript", "Pinia"],
      },
    ],
  },
];

const Experience = () => {
  return (
    <section id="experience" className="py-24 md:py-32 px-6 md:px-12 lg:px-24 pl-12 md:pl-16 lg:pl-28 bg-card relative">
      <SectionHeading title="Experience" number="02" />
      <div className="max-w-5xl space-y-0 relative">
        {experiences.map((exp, i) => (
          <ExperienceItem key={i} {...exp} index={i} />
        ))}
      </div>
    </section>
  );
};

const ExperienceItem = ({
  role, company, period, description, tech, projects, index,
}: (typeof experiences)[0] & { index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative pl-8 pb-16 last:pb-0"
    >
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-foreground/30 via-muted-foreground/10 to-transparent" />
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ duration: 0.4, delay: index * 0.15 + 0.3, type: "spring" }}
        className="absolute left-0 top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-foreground"
      />

      <p className="text-xs font-body text-muted-foreground tracking-widest uppercase mb-2">{period}</p>
      <h3 className="font-heading text-lg md:text-xl text-foreground mb-1 tracking-wide uppercase">
        <Alien text={role} />
      </h3>
      <p className="text-sm font-body text-muted-foreground mb-4">{company}</p>
      <p className="text-sm font-body text-muted-foreground leading-relaxed mb-4">{description}</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {tech.map((t) => (
          <span key={t} className="text-xs font-body text-muted-foreground border border-border px-2.5 py-1 hover:text-foreground hover:border-foreground/30 transition-colors">{t}</span>
        ))}
      </div>

      {projects && projects.length > 0 && (
        <div className="ml-4 space-y-2">
          <p className="text-xs font-body text-muted-foreground tracking-widest uppercase mb-3">Projects</p>
          {projects.map((project, pi) => (
            <motion.div
              key={pi}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.15 + 0.4 + pi * 0.1 }}
              onClick={() => setExpandedProject(expandedProject === pi ? null : pi)}
              className="border border-border p-4 cursor-pointer hover:border-foreground/20 hover:bg-secondary/30 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-body text-muted-foreground">{String(pi + 1).padStart(2, "0")}</span>
                  <h4 className="font-heading text-sm text-foreground tracking-wide uppercase">
                    <Alien text={project.title} />
                  </h4>
                </div>
                <motion.span animate={{ rotate: expandedProject === pi ? 45 : 0 }} className="text-muted-foreground text-lg">+</motion.span>
              </div>
              <motion.div
                initial={false}
                animate={{ height: expandedProject === pi ? "auto" : 0, opacity: expandedProject === pi ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="text-xs font-body text-muted-foreground leading-relaxed mt-3 mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <span key={t} className="text-[10px] font-body text-muted-foreground border border-border px-2 py-0.5">{t}</span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Experience;
