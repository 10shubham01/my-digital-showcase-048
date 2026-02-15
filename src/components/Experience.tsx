import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import SectionHeading from "./SectionHeading";

const experiences = [
  {
    role: "Senior Software Engineer / Lead Developer",
    company: "Credilio Financial Technologies",
    period: "Dec 2022 — Present",
    description:
      "Led a team of engineers, drove delivery of end-to-end credit card and personal loan journeys. Designed multiple AWS architectures from scratch. Integrated observability with New Relic and attribution tracking with Singular.",
    tech: ["Next.js", "TypeScript", "AWS", "Remotion", "Tailwind CSS"],
  },
  {
    role: "Software Engineer / Consultant",
    company: "MountBlue Technologies",
    period: "Aug 2021 — Nov 2022",
    description:
      "Built dynamic web applications using Vue.js, React.js, and Node.js. Delivered robust APIs and database connections with Express.js and PostgreSQL. Migrated Nuxt 2 to Nuxt 3 with optimized architecture.",
    tech: ["Vue.js", "Nuxt.js", "Node.js", "PostgreSQL", "AdonisJS"],
  },
];

const Experience = () => {
  return (
    <section id="experience" className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-card">
      <SectionHeading title="Experience" number="02" />
      <div className="max-w-4xl space-y-16">
        {experiences.map((exp, i) => (
          <ExperienceItem key={i} {...exp} index={i} />
        ))}
      </div>
    </section>
  );
};

const ExperienceItem = ({
  role,
  company,
  period,
  description,
  tech,
  index,
}: (typeof experiences)[0] & { index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="border-l-2 border-accent/30 pl-8 hover:border-accent transition-colors duration-500 group"
    >
      <p className="text-xs font-body text-accent tracking-widest uppercase mb-2">
        {period}
      </p>
      <h3 className="font-heading text-xl md:text-2xl text-foreground mb-1 group-hover:text-gradient transition-all duration-300">{role}</h3>
      <p className="text-sm font-body text-muted-foreground mb-4">{company}</p>
      <p className="text-sm font-body text-muted-foreground leading-relaxed mb-4">
        {description}
      </p>
      <div className="flex flex-wrap gap-2">
        {tech.map((t) => (
          <motion.span
            key={t}
            whileHover={{ scale: 1.05 }}
            className="text-xs font-body text-muted-foreground border border-border px-2.5 py-1 hover:border-accent/40 transition-colors"
          >
            {t}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

export default Experience;
