import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import SectionHeading from "./SectionHeading";

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const skills = [
    "TypeScript", "React", "Next.js", "Vue.js", "Nuxt.js",
    "Node.js", "Tailwind CSS", "PostgreSQL", "AWS", "Git",
  ];

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
            the kind that turn ideas into polished products. Scaling front-end architectures,
            optimizing performance, creating smooth user experiences — been there, done that.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-xs font-body text-muted-foreground tracking-widest uppercase mb-6">
            Technologies
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="text-sm font-body text-secondary-foreground bg-secondary px-3 py-1.5 border border-border"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
