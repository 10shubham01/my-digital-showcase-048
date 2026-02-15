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
      initial={{ opacity: 0, y: 40, rotateX: 5 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, borderColor: "hsl(25, 80%, 55%)" }}
      className="group border border-border p-6 md:p-8 hover:bg-card transition-all duration-500 relative overflow-hidden"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        <span className="text-xs font-body text-accent/60 tracking-widest mb-2 block">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="font-heading text-xl text-foreground mb-3 group-hover:text-gradient transition-all duration-300">
          {title}
        </h3>
        <p className="text-sm font-body text-muted-foreground leading-relaxed mb-5">
          {description}
        </p>
        <div className="flex flex-wrap gap-2">
          {tech.map((t) => (
            <span
              key={t}
              className="text-xs font-body text-muted-foreground border border-border px-2 py-0.5 group-hover:border-accent/20 transition-colors"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Projects;
