import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import SectionHeading from "./SectionHeading";

const commands = [
  { cmd: "whoami", output: "shubham-gupta // full-stack developer" },
  { cmd: "cat contact.txt", output: "shubhamedu.01@gmail.com" },
  { cmd: "ls socials/", output: "GitHub/  LinkedIn/" },
];

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [userInput, setUserInput] = useState("");
  const [extraLines, setExtraLines] = useState<{ cmd: string; output: string }[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && userInput.trim()) {
      const input = userInput.trim().toLowerCase();
      let output = `command not found: ${userInput.trim()}. try "help"`;

      if (input === "help") {
        output = 'available: whoami, email, github, linkedin, clear';
      } else if (input === "email" || input === "mail") {
        output = '→ shubhamedu.01@gmail.com';
        window.open("mailto:shubhamedu.01@gmail.com");
      } else if (input === "github" || input === "gh") {
        output = '→ opening github.com/10shubham01...';
        window.open("https://github.com/10shubham01", "_blank");
      } else if (input === "linkedin" || input === "li") {
        output = '→ opening linkedin.com/in/10shubham01...';
        window.open("https://www.linkedin.com/in/10shubham01", "_blank");
      } else if (input === "clear") {
        setExtraLines([]);
        setUserInput("");
        return;
      }

      setExtraLines((prev) => [...prev, { cmd: userInput.trim(), output }]);
      setUserInput("");
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 px-6 md:px-12 lg:px-24 relative overflow-hidden">
      <SectionHeading title="Get in Touch" number="03" />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-2xl relative"
      >
        <p className="text-base font-body text-muted-foreground leading-relaxed mb-8">
          I built a terminal just for you. Type a command and hit enter.
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="border border-border bg-background overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25" />
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/15" />
            <span className="ml-3 text-xs font-body text-muted-foreground">contact@shubham ~ </span>
          </div>

          <div className="p-4 font-mono text-sm space-y-2 min-h-[200px]">
            {commands.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.4 + i * 0.4 }}
              >
                <div className="flex gap-2">
                  <span className="text-foreground">❯</span>
                  <span className="text-foreground">{line.cmd}</span>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.3, delay: 0.6 + i * 0.4 }}
                  className="text-muted-foreground pl-5"
                >
                  {line.output}
                </motion.div>
              </motion.div>
            ))}

            {extraLines.map((line, i) => (
              <div key={`extra-${i}`}>
                <div className="flex gap-2">
                  <span className="text-foreground">❯</span>
                  <span className="text-foreground">{line.cmd}</span>
                </div>
                <div className="text-muted-foreground pl-5">{line.output}</div>
              </div>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.4 + commands.length * 0.4 }}
              className="flex gap-2 items-center"
            >
              <span className="text-foreground">❯</span>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='type "help" for commands...'
                className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/30 font-mono text-sm caret-foreground"
              />
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                className="w-2 h-4 bg-foreground inline-block"
              />
            </motion.div>
          </div>
        </motion.div>

        <div className="flex gap-4 mt-6">
          {[
            { label: "GitHub", href: "https://github.com/10shubham01" },
            { label: "LinkedIn", href: "https://www.linkedin.com/in/10shubham01" },
            { label: "Email", href: "mailto:shubhamedu.01@gmail.com" },
          ].map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              target={link.label !== "Email" ? "_blank" : undefined}
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              className="text-xs font-body text-muted-foreground transition-colors duration-300 border border-border px-3 py-1.5 hover:border-foreground/30 hover:text-foreground"
            >
              {link.label} ↗
            </motion.a>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Contact;
