import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import SectionHeading from "./SectionHeading";

// Simulated file system
const fileSystem: Record<string, string | Record<string, string>> = {
  "~": {
    "about.txt": "Shubham Gupta — Full-Stack Developer\n3+ years of experience building high-performance web apps.\nSpecializing in React, Next.js, Vue.js, TypeScript, and AWS.",
    "contact.json": JSON.stringify({ email: "shubhamedu.01@gmail.com", github: "10shubham01", linkedin: "10shubham01" }, null, 2),
    "skills.csv": "TypeScript,React,Next.js,Vue.js,Nuxt.js,Node.js,Tailwind CSS,PostgreSQL,AWS,Git",
    "resume.md": "# Shubham Gupta\n## Senior Software Engineer @ Credilio (2022-Present)\n- Led engineering team, designed AWS architectures\n- Built Bureau Wrap, Customer Portal, Advisor Portal\n## Software Engineer @ MountBlue (2021-2022)\n- Vue.js, React, Node.js full-stack development\n- Migrated Nuxt 2 → Nuxt 3",
    ".secret": "⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿\n🎉 You found the easter egg! Type 'hack' for a surprise.",
    "projects/": "DIR",
  },
  "~/projects": {
    "bureau-wrap.md": "# Bureau Wrap Video\nNext.js credit score visualization with Remotion.\nTech: Next.js, Remotion, AWS Lambda, PostgreSQL",
    "customer-portal.md": "# Customer Portal\nWhite-label credit card & personal loan journeys.\nTech: React, Next.js, TypeScript, Zod, Redux",
    "advisor-portal.md": "# Advisor Portal\nMulti-tenant advisory platform.\nTech: React, Next.js, TypeScript, Vite",
  },
};

const ASCII_BANNER = `
 ███████╗██╗  ██╗██╗   ██╗██████╗ ██╗  ██╗ █████╗ ███╗   ███╗
 ██╔════╝██║  ██║██║   ██║██╔══██╗██║  ██║██╔══██╗████╗ ████║
 ███████╗███████║██║   ██║██████╔╝███████║███████║██╔████╔██║
 ╚════██║██╔══██║██║   ██║██╔══██╗██╔══██║██╔══██║██║╚██╔╝██║
 ███████║██║  ██║╚██████╔╝██████╔╝██║  ██║██║  ██║██║ ╚═╝ ██║
 ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝
`;

const MATRIX_RAIN = Array.from({ length: 8 }, () =>
  Array.from({ length: 50 }, () => 
    "ア イ ウ エ オ カ キ ク ケ コ サ シ ス セ ソ".split(" ")[Math.floor(Math.random() * 15)]
  ).join("")
);

const HELP_TEXT = `
┌─────────────────────────────────────────────────────┐
│  AVAILABLE COMMANDS                                 │
├─────────────────────────────────────────────────────┤
│  ls [dir]        list files in directory            │
│  cat <file>      read file contents                 │
│  cd <dir>        change directory                   │
│  pwd             print working directory            │
│  whoami          display user info                  │
│  tree            show file tree                     │
│  neofetch        system info                        │
│  email           open email client                  │
│  github          open GitHub profile                │
│  linkedin        open LinkedIn profile              │
│  history         show command history               │
│  hack            ???                                │
│  matrix          enter the matrix                   │
│  clear           clear terminal                     │
│  help            show this help                     │
└─────────────────────────────────────────────────────┘`;

const NEOFETCH = `
        .--.          shubham@portfolio
       |o_o |         ─────────────────
       |:_/ |         OS: Web/React 18.3
      //   \\ \\        Shell: zsh 5.9
     (|     | )       Terminal: portfolio-term v2.0
    /'\\_   _/\`\\       Theme: Monochrome [Dark]
    \\___)=(___/       Stack: React / Next.js / Vue / TS
                      Uptime: 3+ years engineering
                      Packages: 47 (npm)
                      Resolution: ∞ x ∞
`;

const TREE_VIEW = `
~/
├── about.txt
├── contact.json
├── skills.csv
├── resume.md
├── .secret
└── projects/
    ├── bureau-wrap.md
    ├── customer-portal.md
    └── advisor-portal.md
`;

interface TermLine {
  type: "input" | "output" | "ascii" | "error" | "system";
  content: string;
}

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [userInput, setUserInput] = useState("");
  const [lines, setLines] = useState<TermLine[]>([]);
  const [cwd, setCwd] = useState("~");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [booted, setBooted] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Boot sequence
  useEffect(() => {
    if (isInView && !booted) {
      const bootLines: TermLine[] = [
        { type: "system", content: "Booting portfolio-terminal v2.0..." },
        { type: "system", content: "Loading kernel modules... OK" },
        { type: "system", content: "Mounting filesystem... OK" },
        { type: "system", content: "Starting services... OK" },
        { type: "ascii", content: ASCII_BANNER },
        { type: "system", content: 'Welcome! Type "help" for available commands.\n' },
      ];
      let i = 0;
      const interval = setInterval(() => {
        if (i < bootLines.length) {
          setLines((prev) => [...prev, bootLines[i]]);
          i++;
        } else {
          clearInterval(interval);
          setBooted(true);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isInView, booted]);

  // Auto-scroll
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const getCurrentDir = useCallback(() => {
    return fileSystem[cwd] as Record<string, string> | undefined;
  }, [cwd]);

  const processCommand = useCallback((input: string) => {
    const parts = input.trim().split(/\s+/);
    const cmd = parts[0]?.toLowerCase();
    const args = parts.slice(1).join(" ");
    const newLines: TermLine[] = [{ type: "input", content: `${cwd} ❯ ${input}` }];

    const dir = getCurrentDir();

    switch (cmd) {
      case "help":
        newLines.push({ type: "output", content: HELP_TEXT });
        break;

      case "ls": {
        const targetPath = args ? (args === ".." ? "~" : args.startsWith("~/") ? args : `${cwd}/${args}`.replace("~/~/", "~/")) : cwd;
        const targetDir = fileSystem[targetPath] || fileSystem[targetPath.replace(/\/$/, "")];
        if (targetDir && typeof targetDir === "object") {
          const files = Object.keys(targetDir);
          const formatted = files.map(f => f.endsWith("/") ? `\x1b[1m${f}\x1b[0m` : f).join("  ");
          newLines.push({ type: "output", content: formatted });
        } else if (dir) {
          const files = Object.keys(dir);
          const formatted = files.join("  ");
          newLines.push({ type: "output", content: formatted });
        } else {
          newLines.push({ type: "error", content: `ls: cannot access '${args}': No such directory` });
        }
        break;
      }

      case "cat": {
        if (!args) {
          newLines.push({ type: "error", content: "cat: missing file operand" });
          break;
        }
        const file = dir?.[args];
        if (file && file !== "DIR") {
          newLines.push({ type: "output", content: file });
        } else if (file === "DIR") {
          newLines.push({ type: "error", content: `cat: ${args}: Is a directory` });
        } else {
          newLines.push({ type: "error", content: `cat: ${args}: No such file` });
        }
        break;
      }

      case "cd": {
        if (!args || args === "~") {
          setCwd("~");
          break;
        }
        if (args === "..") {
          setCwd("~");
          break;
        }
        const target = args.startsWith("~/") ? args : `${cwd}/${args}`.replace(/\/$/, "");
        if (fileSystem[target]) {
          setCwd(target);
        } else if (dir?.[args + "/"] === "DIR") {
          setCwd(`${cwd}/${args}`);
        } else {
          newLines.push({ type: "error", content: `cd: ${args}: No such directory` });
        }
        break;
      }

      case "pwd":
        newLines.push({ type: "output", content: `/home/shubham${cwd === "~" ? "" : cwd.replace("~", "")}` });
        break;

      case "whoami":
        newLines.push({ type: "output", content: "shubham-gupta // full-stack developer // 3+ yrs exp" });
        break;

      case "tree":
        newLines.push({ type: "output", content: TREE_VIEW });
        break;

      case "neofetch":
        newLines.push({ type: "output", content: NEOFETCH });
        break;

      case "email":
      case "mail":
        newLines.push({ type: "system", content: "→ Opening mail client for shubhamedu.01@gmail.com..." });
        window.open("mailto:shubhamedu.01@gmail.com");
        break;

      case "github":
      case "gh":
        newLines.push({ type: "system", content: "→ Opening github.com/10shubham01..." });
        window.open("https://github.com/10shubham01", "_blank");
        break;

      case "linkedin":
      case "li":
        newLines.push({ type: "system", content: "→ Opening linkedin.com/in/10shubham01..." });
        window.open("https://www.linkedin.com/in/10shubham01", "_blank");
        break;

      case "history":
        newLines.push({ type: "output", content: commandHistory.map((c, i) => `  ${i + 1}  ${c}`).join("\n") || "  (empty)" });
        break;

      case "hack": {
        const hackLines = [
          "Initiating breach sequence...",
          "████████████████████████████ 100%",
          "Bypassing firewall... ACCESS GRANTED",
          "Decrypting portfolio data...",
          "",
          "Just kidding 😄 But here's my email: shubhamedu.01@gmail.com",
          "Let's build something amazing together!",
        ];
        newLines.push({ type: "system", content: hackLines.join("\n") });
        break;
      }

      case "matrix":
        newLines.push({ type: "ascii", content: MATRIX_RAIN.join("\n") });
        newLines.push({ type: "system", content: "\nWake up, Neo... The Matrix has you.\nFollow the white rabbit. 🐇" });
        break;

      case "clear":
        setLines([]);
        return;

      case "sudo":
        newLines.push({ type: "error", content: "Nice try! But you don't have root access here 😏" });
        break;

      case "rm":
        newLines.push({ type: "error", content: "rm: permission denied. This portfolio is indestructible 💪" });
        break;

      case "exit":
        newLines.push({ type: "system", content: "logout\nYou can check out any time you like, but you can never leave 🎵" });
        break;

      case "date":
        newLines.push({ type: "output", content: new Date().toString() });
        break;

      case "echo":
        newLines.push({ type: "output", content: args || "" });
        break;

      case "ping":
        newLines.push({ type: "output", content: `PING ${args || "localhost"}\n64 bytes: time=0.042ms\n64 bytes: time=0.039ms\n--- ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss` });
        break;

      case "curl":
        newLines.push({ type: "system", content: `Fetching ${args || "nothing"}...\n{"status":"hire_me","available":true,"coffee":"yes_please"}` });
        break;

      default:
        newLines.push({ type: "error", content: `zsh: command not found: ${cmd}\nType "help" for available commands.` });
    }

    setLines((prev) => [...prev, ...newLines]);
    setCommandHistory((prev) => [...prev, input]);
    setHistoryIndex(-1);
  }, [cwd, getCurrentDir, commandHistory]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && userInput.trim()) {
      processCommand(userInput.trim());
      setUserInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setUserInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setUserInput("");
        } else {
          setHistoryIndex(newIndex);
          setUserInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Tab completion
      const dir = getCurrentDir();
      if (dir && userInput.trim()) {
        const parts = userInput.trim().split(/\s+/);
        const partial = parts[parts.length - 1];
        const matches = Object.keys(dir).filter(f => f.startsWith(partial));
        if (matches.length === 1) {
          parts[parts.length - 1] = matches[0];
          setUserInput(parts.join(" "));
        } else if (matches.length > 1) {
          setLines(prev => [...prev, 
            { type: "input", content: `${cwd} ❯ ${userInput}` },
            { type: "output", content: matches.join("  ") }
          ]);
        }
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const getLineColor = (type: TermLine["type"]) => {
    switch (type) {
      case "input": return "text-foreground";
      case "output": return "text-muted-foreground";
      case "ascii": return "text-foreground/60";
      case "error": return "text-destructive";
      case "system": return "text-muted-foreground/80";
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
        className="max-w-3xl relative"
      >
        <p className="text-base font-body text-muted-foreground leading-relaxed mb-8">
          I built a fully interactive terminal for you. Navigate my file system, read about my work, or just type <span className="text-foreground font-mono">help</span>.
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="border border-border bg-background overflow-hidden"
          onClick={() => inputRef.current?.focus()}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25" />
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/15" />
            <span className="ml-3 text-xs font-mono text-muted-foreground">
              shubham@portfolio: {cwd}
            </span>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground/40">
              zsh — 80×24
            </span>
          </div>

          {/* Terminal body */}
          <div
            ref={terminalRef}
            className="p-4 font-mono text-sm space-y-0.5 h-[420px] overflow-y-auto scrollbar-thin"
          >
            {lines.map((line, i) => (
              <motion.pre
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
                className={`${getLineColor(line.type)} whitespace-pre-wrap break-all leading-relaxed text-xs md:text-sm`}
              >
                {line.content}
              </motion.pre>
            ))}

            {/* Input line */}
            {booted && (
              <div className="flex gap-2 items-center pt-1">
                <span className="text-muted-foreground text-xs shrink-0">{cwd} ❯</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder='type "help"...'
                  autoFocus={false}
                  className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/20 font-mono text-xs md:text-sm caret-foreground min-w-0"
                />
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                  className="w-1.5 h-4 bg-foreground inline-block shrink-0"
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick links */}
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
