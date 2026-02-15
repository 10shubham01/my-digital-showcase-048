import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import SectionHeading from "./SectionHeading";

const projects = [
  {
    title: "Bureau Wrap Video",
    description:
      "A Next.js-based credit score visualization platform with Remotion video. Automated creation of personalized credit score presentations, improving client engagement in financial reporting.",
    tech: ["Next.js", "Remotion", "Tailwind", "AWS Lambda", "PostgreSQL"],
  },
  {
    title: "Customer Portal",
    description:
      "White-label customer-facing platform for credit card and personal loan journeys. Built composable components and shared design patterns to support multi-partner customization.",
    tech: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Zod", "Redux"],
  },
  {
    title: "Advisor Portal",
    description:
      "White-label advisory platform supporting multi-tenant workflows. Designed scalable, accessibility-compliant form infrastructure with consistent validation across deployments.",
    tech: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vite"],
  },
  {
    title: "Admin Portal",
    description:
      "Centralized administrative system with role- and policy-driven authorization layer for secure access boundaries across white-label administrative workflows.",
    tech: ["Nuxt.js", "Vue.js", "TypeScript", "Tailwind", "Pinia"],
  },
];

const Projects = () => {
  return (
    <section id="projects" className="py-24 md:py-32 px-6 md:px-12 lg:px-24">
      <SectionHeading title="Projects" number="03" />
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
        {projects.map((project, i) => (
          <ProjectCard key={i} {...project} index={i} />
        ))}
      </div>
    </section>
  );
};

const ProjectCard = ({
  title,
  description,
  tech,
  index,
}: (typeof projects)[0] & { index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group border border-border p-6 md:p-8 hover:bg-card transition-colors duration-300"
    >
      <h3 className="font-heading text-xl text-foreground mb-3">{title}</h3>
      <p className="text-sm font-body text-muted-foreground leading-relaxed mb-5">
        {description}
      </p>
      <div className="flex flex-wrap gap-2">
        {tech.map((t) => (
          <span
            key={t}
            className="text-xs font-body text-muted-foreground border border-border px-2 py-0.5"
          >
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default Projects;
