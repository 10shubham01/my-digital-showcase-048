import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import SectionHeading from "./SectionHeading";

// Virtual file system
const fileSystem: Record<string, Record<string, string>> = {
  "~": {
    "about.txt": "Shubham Gupta -- Full-Stack Developer\n3+ years of experience building high-performance web apps.\nSpecializing in React, Next.js, Vue.js, TypeScript, and AWS.\n\nCurrently building a no-code platform to democratize software development.",
    "contact.json": JSON.stringify({ email: "shubhamedu.01@gmail.com", github: "10shubham01", linkedin: "10shubham01", website: "shubhamgupta.dev" }, null, 2),
    "skills.csv": "Category,Skills\nFrontend,React / Next.js / Vue.js / Nuxt.js / TypeScript\nStyling,Tailwind CSS / Styled Components / CSS Modules\nBackend,Node.js / Express / AdonisJS / PostgreSQL\nCloud,AWS Lambda / S3 / CloudFront / EC2\nTools,Git / Docker / New Relic / Vite / Turborepo",
    "resume.md": "# Shubham Gupta\n\n## Currently Building\nNo-Code Platform -- Democratizing software development\n   Tech: React, TypeScript, Node.js, PostgreSQL, AWS\n\n## Senior Software Engineer @ Credilio (Dec 2022 -- Present)\n- Led engineering team of 5, designed AWS architectures from scratch\n- Built Bureau Wrap Video, Customer Portal, Advisor Portal\n- Integrated New Relic observability & Singular attribution\n\n## Software Engineer @ MountBlue (Aug 2021 -- Nov 2022)\n- Vue.js, React, Node.js full-stack development\n- Migrated Nuxt 2 -> Nuxt 3\n- Built Admin Portal with role-based authorization",
    ".secret": "You found the easter egg!\nType 'hack' for a surprise.",
    ".env": "# Environment Variables\nNODE_ENV=production\nPORTFOLIO_VERSION=3.0.0\nCOFFEE_LEVEL=critical\nBUGS_FOUND=0\nBUGS_CREATED=infinity",
    "projects/": "DIR",
    "scripts/": "DIR",
  },
  "~/projects": {
    "nocode-platform.md": "# No-Code Platform (Current)\nDemocratizing software development.\nBuild full-stack apps without writing code.\nTech: React, TypeScript, Node.js, PostgreSQL, AWS\nStatus: In Development",
    "bureau-wrap.md": "# Bureau Wrap Video\nNext.js credit score visualization with Remotion.\nAutomated personalized credit score video presentations.\nTech: Next.js, Remotion, AWS Lambda, PostgreSQL",
    "customer-portal.md": "# Customer Portal\nWhite-label credit card & personal loan journeys.\nComposable component architecture with form validation.\nTech: React, Next.js, TypeScript, Zod, Redux",
    "advisor-portal.md": "# Advisor Portal\nMulti-tenant advisory platform.\nAccessible form infrastructure with white-label support.\nTech: React, Next.js, TypeScript, Vite",
    "admin-portal.md": "# Admin Portal\nCentralized admin system with role & policy-driven auth.\nBuilt during MountBlue tenure.\nTech: Nuxt.js, Vue.js, TypeScript, Pinia",
  },
  "~/scripts": {
    "hello.js": "console.log('Hello from Shubham!');\nconsole.log('Welcome to my portfolio terminal.');\n\nconst skills = ['React', 'Next.js', 'Vue.js', 'TypeScript', 'AWS'];\nskills.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));",
    "fibonacci.js": "function fib(n) {\n  if (n <= 1) return n;\n  return fib(n - 1) + fib(n - 2);\n}\n\nfor (let i = 0; i < 10; i++) {\n  console.log(`fib(${i}) = ${fib(i)}`);\n}",
    "fizzbuzz.js": "for (let i = 1; i <= 30; i++) {\n  let out = '';\n  if (i % 3 === 0) out += 'Fizz';\n  if (i % 5 === 0) out += 'Buzz';\n  console.log(out || i);\n}",
    "README.md": "# Scripts\nRun JavaScript files with: node <filename>\nOr start a REPL with: node\nOr run inline JS with: node -e \"code here\"",
  },
};

const ASCII_BANNER = `
 ███████╗██╗  ██╗██╗   ██╗██████╗ ██╗  ██╗ █████╗ ███╗   ███╗
 ██╔════╝██║  ██║██║   ██║██╔══██╗██║  ██║██╔══██╗████╗ ████║
 ███████╗███████║██║   ██║██████╔╝███████║███████║██╔████╔██║
 ╚════██║██╔══██║██║   ██║██╔══██╗██╔══██║██╔══██║██║╚██╔╝██║
 ███████║██║  ██║╚██████╔╝██████╔╝██║  ██║██║  ██║██║ ╚═╝ ██║
 ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝`;

const MATRIX_RAIN = Array.from({ length: 12 }, () =>
  Array.from({ length: 60 }, () =>
    "ア イ ウ エ オ カ キ ク ケ コ サ シ ス セ ソ タ チ ツ テ ト".split(" ")[Math.floor(Math.random() * 20)]
  ).join("")
);

const HELP_TEXT = `
AVAILABLE COMMANDS
==================

FILE SYSTEM
  ls [dir]          list files in directory
  cat <file>        read file contents
  cd <dir>          change directory
  pwd               print working directory
  tree              show file tree
  find <pattern>    search for files
  grep <text>       search file contents
  touch <file>      create empty file
  mkdir <name>      create directory
  wc <file>         word/line count

INFO
  whoami            display user info
  neofetch          system info
  uptime            show experience duration
  skills            show skills bar
  weather           coding weather

JAVASCRIPT
  node              start JS REPL (type .exit to quit)
  node <file.js>    run a JS file from ~/scripts/
  node -e "code"    evaluate inline JavaScript

LINKS
  email             open email client
  github / gh       open GitHub profile
  linkedin / li     open LinkedIn profile

FUN
  hack              ???
  matrix            enter the matrix
  fortune           dev fortune cookie
  cowsay <msg>      cow says what?
  figlet <text>     ASCII art text
  joke              random dev joke
  quiz              dev trivia

SYSTEM
  history           show command history
  clear / ctrl+l    clear terminal
  theme             toggle dark/light
  banner            show welcome banner
  help              show this help
  man <cmd>         manual for a command
  alias             show command aliases
  top               process list
  df                disk usage
  cal               calendar
  date              current date
  echo <text>       print text
  ping <host>       ping a host
  curl <url>        fetch a url`;

const NEOFETCH = `
        .--.          shubham@portfolio
       |o_o |         ---------------------
       |:_/ |         OS: Web/React 18.3
      //   \\ \\        Shell: zsh 5.9
     (|     | )       Terminal: portfolio-term v3.0
    /'\\_   _/\`\\       Theme: Monochrome [Dark/Light]
    \\___)=(___/       Stack: React / Next.js / Vue / TS
                      Cloud: AWS Lambda / S3 / CloudFront
                      Uptime: ${Math.floor((Date.now() - new Date("2021-08-01").getTime()) / (1000 * 60 * 60 * 24))} days engineering
                      Packages: 47 (npm)
                      Resolution: inf x inf
                      Current: Building No-Code Platform
`;

const TREE_VIEW = `
~/
|-- about.txt
|-- contact.json
|-- skills.csv
|-- resume.md
|-- .secret
|-- .env
|-- projects/
|   |-- nocode-platform.md  <-- current
|   |-- bureau-wrap.md
|   |-- customer-portal.md
|   |-- advisor-portal.md
|   \`-- admin-portal.md
\`-- scripts/
    |-- hello.js
    |-- fibonacci.js
    |-- fizzbuzz.js
    \`-- README.md
`;

const FORTUNES = [
  "A merge conflict in your future will lead to enlightenment.",
  "The bug you seek is on line 42. It's always line 42.",
  "Your next npm install will only add 847 packages.",
  "A production deployment on Friday brings wisdom through suffering.",
  "The code you write today will confuse you in 6 months.",
  "Someone will say 'it works on my machine' today.",
  "You will mass-delete node_modules and feel strangely free.",
  "A semicolon will save your life today. Or ruin it.",
  "Your PR will be approved without comments. Just kidding.",
  "Today's Stack Overflow answer was written by you, 3 years ago.",
];

const JOKES = [
  "Why do programmers prefer dark mode?\nBecause light attracts bugs.",
  "A SQL query walks into a bar, walks up to two tables and asks...\n'Can I join you?'",
  "!false -- It's funny because it's true.",
  "How many programmers does it take to change a light bulb?\nNone. That's a hardware problem.",
  "Why do Java developers wear glasses?\nBecause they can't C#.",
  "What's a programmer's favorite hangout place?\nFoo Bar.",
  "There are only 10 types of people in the world:\nThose who understand binary and those who don't.",
  "Algorithm: Word used by programmers when they\ndon't want to explain what they did.",
];

const QUIZ_QUESTIONS = [
  { q: "What does CSS stand for?", a: "Cascading Style Sheets", options: ["A) Creative Style System", "B) Cascading Style Sheets", "C) Computer Style Sheets"] },
  { q: "Which company created React?", a: "Meta (Facebook)", options: ["A) Google", "B) Meta (Facebook)", "C) Microsoft"] },
  { q: "What year was TypeScript released?", a: "2012", options: ["A) 2010", "B) 2012", "C) 2015"] },
  { q: "What does API stand for?", a: "Application Programming Interface", options: ["A) Application Programming Interface", "B) Advanced Program Integration", "C) Automated Protocol Interface"] },
];

const COWSAY = (msg: string) => {
  const line = "-".repeat(msg.length + 2);
  return `
 +${line}+
 | ${msg} |
 +${line}+
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
};

const FIGLET_CHARS: Record<string, string[]> = {
  a: ["  #  ", " # # ", "#####", "#   #", "#   #"],
  b: ["#### ", "#   #", "#### ", "#   #", "#### "],
  c: [" ####", "#    ", "#    ", "#    ", " ####"],
  d: ["#### ", "#   #", "#   #", "#   #", "#### "],
  e: ["#####", "#    ", "#### ", "#    ", "#####"],
  f: ["#####", "#    ", "#### ", "#    ", "#    "],
  g: [" ####", "#    ", "#  ##", "#   #", " ####"],
  h: ["#   #", "#   #", "#####", "#   #", "#   #"],
  i: ["#####", "  #  ", "  #  ", "  #  ", "#####"],
  j: ["#####", "   # ", "   # ", "#  # ", " ##  "],
  k: ["#   #", "#  # ", "###  ", "#  # ", "#   #"],
  l: ["#    ", "#    ", "#    ", "#    ", "#####"],
  m: ["#   #", "## ##", "# # #", "#   #", "#   #"],
  n: ["#   #", "##  #", "# # #", "#  ##", "#   #"],
  o: [" ### ", "#   #", "#   #", "#   #", " ### "],
  p: ["#### ", "#   #", "#### ", "#    ", "#    "],
  q: [" ### ", "#   #", "# # #", "#  # ", " ## #"],
  r: ["#### ", "#   #", "#### ", "#  # ", "#   #"],
  s: [" ####", "#    ", " ### ", "    #", "#### "],
  t: ["#####", "  #  ", "  #  ", "  #  ", "  #  "],
  u: ["#   #", "#   #", "#   #", "#   #", " ### "],
  v: ["#   #", "#   #", " # # ", " # # ", "  #  "],
  w: ["#   #", "#   #", "# # #", "## ##", "#   #"],
  x: ["#   #", " # # ", "  #  ", " # # ", "#   #"],
  y: ["#   #", " # # ", "  #  ", "  #  ", "  #  "],
  z: ["#####", "   # ", "  #  ", " #   ", "#####"],
  " ": ["     ", "     ", "     ", "     ", "     "],
};

// Simple JS runtime for the REPL
const runJS = (code: string): string => {
  const logs: string[] = [];
  const fakeConsole = {
    log: (...args: unknown[]) => logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" ")),
    error: (...args: unknown[]) => logs.push("Error: " + args.map(a => String(a)).join(" ")),
    warn: (...args: unknown[]) => logs.push("Warning: " + args.map(a => String(a)).join(" ")),
    info: (...args: unknown[]) => logs.push(args.map(a => String(a)).join(" ")),
    table: (data: unknown) => logs.push(JSON.stringify(data, null, 2)),
  };

  try {
    // Create a sandboxed function with overridden console
    const fn = new Function("console", "Math", "Date", "JSON", "Array", "Object", "String", "Number", "Boolean", "RegExp", "Map", "Set", "Promise", "parseInt", "parseFloat", "isNaN", "isFinite", "undefined",
      `"use strict";\n${code}`
    );
    const result = fn(fakeConsole, Math, Date, JSON, Array, Object, String, Number, Boolean, RegExp, Map, Set, Promise, parseInt, parseFloat, isNaN, isFinite, undefined);
    
    if (result !== undefined && logs.length === 0) {
      logs.push(typeof result === "object" ? JSON.stringify(result, null, 2) : String(result));
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logs.push(`Error: ${message}`);
  }

  return logs.join("\n");
};

interface TermLine {
  type: "input" | "output" | "ascii" | "error" | "system" | "success" | "warning";
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
  const [isMaximized, setIsMaximized] = useState(false);
  const [jsRepl, setJsRepl] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ESC to close fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isMaximized) setIsMaximized(false);
        if (jsRepl) {
          setJsRepl(false);
          setLines(prev => [...prev, { type: "system", content: "Exited Node.js REPL." }]);
        }
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isMaximized, jsRepl]);

  // Boot sequence
  useEffect(() => {
    if (isInView && !booted) {
      const bootLines: TermLine[] = [
        { type: "system", content: "Booting portfolio-terminal v3.0..." },
        { type: "system", content: "Loading kernel modules.......... OK" },
        { type: "system", content: "Mounting virtual filesystem...... OK" },
        { type: "system", content: "Starting network services........ OK" },
        { type: "system", content: "Initializing JS runtime.......... OK" },
        { type: "system", content: "Loading developer profile......... OK" },
        { type: "ascii", content: ASCII_BANNER },
        { type: "system", content: 'System ready. Type "help" for available commands.\n' },
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
      }, 150);
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
    // Handle JS REPL mode
    if (jsRepl) {
      if (input === ".exit" || input === "exit") {
        setJsRepl(false);
        setLines(prev => [...prev,
          { type: "input", content: `> ${input}` },
          { type: "system", content: "Exited Node.js REPL." },
        ]);
        setCommandHistory((prev) => [...prev, input]);
        return;
      }
      const output = runJS(input);
      setLines(prev => [...prev,
        { type: "input", content: `> ${input}` },
        ...(output ? [{ type: "output" as const, content: output }] : []),
      ]);
      setCommandHistory((prev) => [...prev, input]);
      setHistoryIndex(-1);
      return;
    }

    const parts = input.trim().split(/\s+/);
    const cmd = parts[0]?.toLowerCase();
    const args = parts.slice(1).join(" ");
    const newLines: TermLine[] = [{ type: "input", content: `${cwd} $ ${input}` }];

    const dir = getCurrentDir();

    switch (cmd) {
      case "help":
        newLines.push({ type: "output", content: HELP_TEXT });
        break;

      case "ls": {
        const targetPath = args ? (args === ".." ? "~" : args.startsWith("~/") ? args : `${cwd}/${args}`.replace("~/~/", "~/")) : cwd;
        const targetDir = fileSystem[targetPath] || fileSystem[targetPath.replace(/\/$/, "")];
        const renderDir = (d: Record<string, string>) => {
          const files = Object.keys(d);
          return files.join("  ");
        };
        if (targetDir && typeof targetDir === "object") {
          newLines.push({ type: "output", content: renderDir(targetDir) });
        } else if (dir) {
          newLines.push({ type: "output", content: renderDir(dir) });
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
        if (!args || args === "~") { setCwd("~"); break; }
        if (args === "..") { setCwd("~"); break; }
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
        newLines.push({ type: "output", content: "shubham-gupta\nRole: Full-Stack Developer\nExperience: " + Math.floor((Date.now() - new Date("2021-08-01").getTime()) / (1000 * 60 * 60 * 24 * 365.25)) + "+ years\nStatus: Building No-Code Platform\nCoffee: [================] 100%" });
        break;

      case "tree":
        newLines.push({ type: "output", content: TREE_VIEW });
        break;

      case "neofetch":
        newLines.push({ type: "output", content: NEOFETCH });
        break;

      case "uptime": {
        const ms = Date.now() - new Date("2021-08-01").getTime();
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        newLines.push({ type: "output", content: `up ${days} days, ${hours} hours -- engineering since Aug 2021\n\nMilestones:\n  Day    0: Started at MountBlue Technologies\n  Day  487: Joined Credilio as Senior Engineer\n  Day ${days}: Still shipping code` });
        break;
      }

      case "skills":
        newLines.push({ type: "output", content: `
 Frontend  [====================]  95%
 Backend   [===============     ]  75%
 Cloud/AWS [================    ]  80%
 DevOps    [==============      ]  70%
 UI/UX     [================    ]  80%
 Coffee    [====================] 100%` });
        break;

      case "weather":
        newLines.push({ type: "output", content: `
Coding Weather Report
---------------------
  Temperature: Hot (shipping fast)
  Wind:        Strong tailwind(css)
  Visibility:  Clear (TypeScript)
  Humidity:    Low (clean code)
  Forecast:    Deploy-ready
  Alert:       Friday deploy incoming` });
        break;

      case "find": {
        if (!args) { newLines.push({ type: "error", content: "find: missing pattern" }); break; }
        const results: string[] = [];
        Object.entries(fileSystem).forEach(([path, files]) => {
          if (typeof files === "object") {
            Object.keys(files).forEach(f => {
              if (f.toLowerCase().includes(args.toLowerCase())) {
                results.push(`${path}/${f}`);
              }
            });
          }
        });
        newLines.push({ type: "output", content: results.length ? results.join("\n") : `No files matching '${args}'` });
        break;
      }

      case "grep": {
        if (!args) { newLines.push({ type: "error", content: "grep: missing search text" }); break; }
        const grepResults: string[] = [];
        Object.entries(fileSystem).forEach(([path, files]) => {
          if (typeof files === "object") {
            Object.entries(files).forEach(([fname, content]) => {
              if (content !== "DIR" && content.toLowerCase().includes(args.toLowerCase())) {
                const matchLine = content.split("\n").find(l => l.toLowerCase().includes(args.toLowerCase()));
                grepResults.push(`${path}/${fname}: ${matchLine?.trim()}`);
              }
            });
          }
        });
        newLines.push({ type: "output", content: grepResults.length ? grepResults.join("\n") : `No matches for '${args}'` });
        break;
      }

      case "touch": {
        if (!args) { newLines.push({ type: "error", content: "touch: missing file operand" }); break; }
        if (dir) {
          dir[args] = "";
          newLines.push({ type: "output", content: `created: ${args}` });
        }
        break;
      }

      case "mkdir": {
        if (!args) { newLines.push({ type: "error", content: "mkdir: missing operand" }); break; }
        if (dir) {
          dir[args + "/"] = "DIR";
          fileSystem[`${cwd}/${args}`] = {};
          newLines.push({ type: "output", content: `mkdir: created directory '${args}'` });
        }
        break;
      }

      case "wc": {
        if (!args) { newLines.push({ type: "error", content: "wc: missing file operand" }); break; }
        const wcFile = dir?.[args];
        if (wcFile && wcFile !== "DIR") {
          const wlines = wcFile.split("\n").length;
          const words = wcFile.split(/\s+/).length;
          const chars = wcFile.length;
          newLines.push({ type: "output", content: `  ${wlines}  ${words}  ${chars} ${args}` });
        } else {
          newLines.push({ type: "error", content: `wc: ${args}: No such file` });
        }
        break;
      }

      // JavaScript execution
      case "node": {
        if (!args) {
          // Enter REPL mode
          setJsRepl(true);
          newLines.push({ type: "system", content: "Welcome to Node.js v18.17.0 (portfolio-runtime)\nType .exit or press ESC to exit the REPL.\n>" });
          break;
        }
        if (args.startsWith("-e ")) {
          // Inline evaluation
          const code = args.slice(3).replace(/^["']|["']$/g, "");
          const output = runJS(code);
          newLines.push({ type: "output", content: output || "(undefined)" });
          break;
        }
        // Run a file from ~/scripts/
        const scriptDir = fileSystem["~/scripts"];
        const scriptFile = scriptDir?.[args] || scriptDir?.[args + ".js"];
        if (scriptFile && scriptFile !== "DIR") {
          newLines.push({ type: "system", content: `Running ${args}...\n` });
          const output = runJS(scriptFile);
          newLines.push({ type: "output", content: output || "(no output)" });
        } else {
          newLines.push({ type: "error", content: `node: cannot find module '${args}'\nAvailable scripts: ${Object.keys(fileSystem["~/scripts"] || {}).filter(f => f.endsWith(".js")).join(", ")}` });
        }
        break;
      }

      case "npm": {
        if (args === "install" || args === "i") {
          newLines.push({ type: "system", content: "npm warn portfolio-terminal@3.0.0 No description\nnpm warn portfolio-terminal@3.0.0 No repository field.\n\nadded 0 packages in 0.42s\n\n0 packages are looking for funding\n  run `npm fund` for details" });
        } else if (args.startsWith("run ")) {
          const script = args.slice(4);
          newLines.push({ type: "system", content: `> portfolio-terminal@3.0.0 ${script}\n> echo "no script specified"\n\nno script specified` });
        } else if (args === "list" || args === "ls") {
          newLines.push({ type: "output", content: "portfolio-terminal@3.0.0\n+-- react@18.3.1\n+-- typescript@5.3.0\n+-- vite@5.0.0\n+-- tailwindcss@3.4.0\n`-- framer-motion@12.34.0" });
        } else {
          newLines.push({ type: "output", content: `npm <command>\n\nUsage:\n  npm install     install dependencies\n  npm run <cmd>   run a script\n  npm list        list installed packages` });
        }
        break;
      }

      case "email":
      case "mail":
        newLines.push({ type: "system", content: "Opening mail client for shubhamedu.01@gmail.com..." });
        window.open("mailto:shubhamedu.01@gmail.com");
        break;

      case "github":
      case "gh":
        newLines.push({ type: "system", content: "Opening github.com/10shubham01..." });
        window.open("https://github.com/10shubham01", "_blank");
        break;

      case "linkedin":
      case "li":
        newLines.push({ type: "system", content: "Opening linkedin.com/in/10shubham01..." });
        window.open("https://www.linkedin.com/in/10shubham01", "_blank");
        break;

      case "history":
        newLines.push({ type: "output", content: commandHistory.map((c, i) => `  ${i + 1}  ${c}`).join("\n") || "  (empty)" });
        break;

      case "hack": {
        const hackLines = [
          "Initiating breach sequence...",
          "[################################] 100%",
          "Bypassing firewall......... ACCESS GRANTED",
          "Decrypting portfolio data.. COMPLETE",
          "Extracting secrets......... FOUND",
          "",
          "Just kidding. But here's my email: shubhamedu.01@gmail.com",
          "Let's build something amazing together.",
          "",
          "Tip: I'm currently building a no-code platform.",
          "     Type 'cat resume.md' for more.",
        ];
        newLines.push({ type: "system", content: hackLines.join("\n") });
        break;
      }

      case "matrix":
        newLines.push({ type: "ascii", content: MATRIX_RAIN.join("\n") });
        newLines.push({ type: "system", content: "\nWake up, Neo... The Matrix has you.\nFollow the white rabbit.\nType 'hack' to go deeper..." });
        break;

      case "fortune":
        newLines.push({ type: "output", content: FORTUNES[Math.floor(Math.random() * FORTUNES.length)] });
        break;

      case "joke":
        newLines.push({ type: "output", content: JOKES[Math.floor(Math.random() * JOKES.length)] });
        break;

      case "cowsay":
        newLines.push({ type: "ascii", content: COWSAY(args || "Moo! Hire Shubham!") });
        break;

      case "figlet": {
        const text = (args || "hello").toLowerCase().slice(0, 12);
        const rows = [0, 1, 2, 3, 4].map(row =>
          text.split("").map(ch => (FIGLET_CHARS[ch] || FIGLET_CHARS[" "])[row]).join(" ")
        );
        newLines.push({ type: "ascii", content: rows.join("\n") });
        break;
      }

      case "quiz": {
        const q = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
        newLines.push({ type: "output", content: `${q.q}\n${q.options.join("\n")}\n\n(Answer: ${q.a})` });
        break;
      }

      case "man": {
        const manPages: Record<string, string> = {
          ls: "LS(1)\n\nNAME\n  ls - list directory contents\n\nSYNOPSIS\n  ls [dir]\n\nDESCRIPTION\n  List files and directories in the current or specified directory.",
          cat: "CAT(1)\n\nNAME\n  cat - concatenate and print files\n\nSYNOPSIS\n  cat <file>\n\nDESCRIPTION\n  Display contents of a file in the virtual filesystem.",
          cd: "CD(1)\n\nNAME\n  cd - change directory\n\nSYNOPSIS\n  cd <dir>\n\nDESCRIPTION\n  Navigate the virtual filesystem. Use '..' to go up.",
          node: "NODE(1)\n\nNAME\n  node - JavaScript runtime\n\nSYNOPSIS\n  node              start REPL\n  node <file.js>    run script from ~/scripts/\n  node -e \"code\"    evaluate inline JS\n\nDESCRIPTION\n  Execute JavaScript code in a sandboxed environment.\n  Console output is captured and displayed in the terminal.",
          hack: "HACK(1)\n\nNAME\n  hack - totally legit hacking tool\n\nWARNING\n  This command is 100% safe and mostly just for fun.",
        };
        newLines.push({ type: "output", content: manPages[args] || `No manual entry for '${args}'` });
        break;
      }

      case "alias":
        newLines.push({ type: "output", content: "Aliases:\n  gh    -> github\n  li    -> linkedin\n  mail  -> email\n  cls   -> clear" });
        break;

      case "banner":
        newLines.push({ type: "ascii", content: ASCII_BANNER });
        break;

      case "theme":
        document.documentElement.classList.toggle("dark");
        newLines.push({ type: "system", content: `Theme toggled to ${document.documentElement.classList.contains("dark") ? "dark" : "light"}` });
        break;

      case "clear":
      case "cls":
        setLines([]);
        return;

      case "sudo":
        newLines.push({ type: "error", content: "Nice try! But you don't have root access here.\nThis incident will be reported. (Just kidding)" });
        break;

      case "rm":
        newLines.push({ type: "error", content: "rm: permission denied. This portfolio is indestructible." });
        break;

      case "exit":
      case "quit":
        newLines.push({ type: "system", content: "logout\nYou can check out any time you like, but you can never leave." });
        break;

      case "date":
        newLines.push({ type: "output", content: new Date().toString() });
        break;

      case "echo":
        newLines.push({ type: "output", content: args || "" });
        break;

      case "ping":
        newLines.push({ type: "output", content: `PING ${args || "shubhamgupta.dev"}\n64 bytes: time=0.042ms\n64 bytes: time=0.039ms\n64 bytes: time=0.041ms\n--- ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss\navg latency: 0.041ms` });
        break;

      case "curl":
        newLines.push({ type: "system", content: `GET ${args || "shubhamgupta.dev/api"} HTTP/1.1\n\n{\n  "status": "hire_me",\n  "available": true,\n  "coffee": "yes_please",\n  "current_project": "no-code-platform",\n  "response_time": "< 24h"\n}` });
        break;

      case "top":
      case "htop":
        newLines.push({ type: "output", content: `PID  COMMAND          CPU%  MEM%  STATUS\n 1   react-dev        45.2  128M  running\n 2   typescript-lsp   12.8   64M  running\n 3   tailwind-jit      8.4   32M  running\n 4   vite-hmr          3.2   16M  running\n 5   coffee-machine   99.9  inf   critical\n 6   imposter-syn.     0.1   1M   sleeping\n 7   motivation       78.3   42M  running` });
        break;

      case "w":
        newLines.push({ type: "output", content: "USER     TTY   LOGIN@  IDLE\nshubham  pts/0 now     0:00\nguest    pts/1 now     active  <-- that's you!" });
        break;

      case "cal": {
        const now = new Date();
        const month = now.toLocaleString("default", { month: "long" });
        newLines.push({ type: "output", content: `     ${month} ${now.getFullYear()}\nSu Mo Tu We Th Fr Sa\n${Array.from({ length: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() }, (_, i) => String(i + 1).padStart(2, " ") + ((i + 1) === now.getDate() ? "*" : " ")).reduce((acc, d, i) => { const dayOfWeek = new Date(now.getFullYear(), now.getMonth(), i + 1).getDay(); if (i === 0) acc += "   ".repeat(dayOfWeek); acc += d; if (dayOfWeek === 6) acc += "\n"; return acc; }, "")}` });
        break;
      }

      case "df":
        newLines.push({ type: "output", content: "Filesystem    Size  Used  Avail  Use%  Mounted on\nportfolio     inf   42K   inf    0%    /\ncreativity    inf   99%   1%     99%   /brain\ncoffee-tank   10L   9.8L  0.2L   98%   /energy" });
        break;

      default:
        newLines.push({ type: "error", content: `zsh: command not found: ${cmd}\nType "help" for available commands.` });
    }

    setLines((prev) => [...prev, ...newLines]);
    setCommandHistory((prev) => [...prev, input]);
    setHistoryIndex(-1);
  }, [cwd, getCurrentDir, commandHistory, jsRepl]);

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
            { type: "input", content: `${cwd} $ ${userInput}` },
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
      case "success": return "text-foreground";
      case "warning": return "text-muted-foreground";
    }
  };

  const prompt = jsRepl ? "> " : `${cwd} $ `;

  return (
    <section id="contact" className="py-24 md:py-32 px-6 md:px-12 lg:px-24 relative overflow-hidden">
      <SectionHeading title="Get in Touch" number="03" />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-4xl relative"
      >
        <p className="text-base font-body text-muted-foreground leading-relaxed mb-8">
          Fully interactive terminal — navigate my filesystem, run JavaScript, or type <span className="text-foreground font-mono">help</span>. Try <span className="text-foreground font-mono">node</span> to start a JS REPL.
        </p>

        <AnimatePresence>
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`border border-border bg-background overflow-hidden transition-all duration-300 ${
              isMaximized ? "fixed inset-4 z-50 shadow-2xl" : "relative"
            }`}
            onClick={() => inputRef.current?.focus()}
          >
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card select-none">
              <button
                onClick={(e) => { e.stopPropagation(); if (isMaximized) setIsMaximized(false); }}
                className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-90 transition-all cursor-pointer"
                title="Close"
              />
              <button
                onClick={(e) => { e.stopPropagation(); setLines([]); }}
                className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-90 transition-all cursor-pointer"
                title="Minimize (clear)"
              />
              <button
                onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }}
                className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-90 transition-all cursor-pointer"
                title={isMaximized ? "Exit fullscreen (ESC)" : "Maximize"}
              />
              <span className="ml-3 text-xs font-mono text-muted-foreground">
                {jsRepl ? "node — REPL" : `shubham@portfolio: ${cwd}`}
              </span>
              <span className="ml-auto text-[10px] font-mono text-muted-foreground/40 hidden sm:inline">
                {jsRepl ? "node v18.17.0" : `zsh — ${isMaximized ? "fullscreen (ESC to exit)" : "80x24"}`}
              </span>
            </div>

            {/* Terminal body */}
            <div
              ref={terminalRef}
              className={`p-4 font-mono text-sm space-y-0.5 overflow-y-auto scrollbar-thin transition-all duration-300 ${
                isMaximized ? "h-[calc(100%-44px)]" : "h-[450px]"
              }`}
            >
              {lines.map((line, i) => (
                <pre
                  key={i}
                  className={`${getLineColor(line.type)} whitespace-pre-wrap break-all leading-relaxed text-xs md:text-sm`}
                >
                  {line.content}
                </pre>
              ))}

              {/* Input line */}
              {booted && (
                <div className="flex gap-2 items-center pt-1">
                  <span className="text-muted-foreground text-xs shrink-0">{prompt}</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={jsRepl ? "type JS code..." : 'type "help"...'}
                    autoFocus={false}
                    className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/20 font-mono text-xs md:text-sm caret-foreground min-w-0"
                  />
                  <span className="w-1.5 h-4 bg-foreground inline-block shrink-0 animate-pulse" />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Maximized overlay */}
        {isMaximized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsMaximized(false)}
          />
        )}

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
              {link.label}
            </motion.a>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Contact;
