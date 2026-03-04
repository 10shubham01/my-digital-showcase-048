import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Maximize2, Minimize2 } from "lucide-react";
import type { Project } from "@/hooks/useProjects";
import type { Task, TaskStatus, TaskPriority } from "@/hooks/useTasks";
import { useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { useQueryClient } from "@tanstack/react-query";

interface TodoTerminalProps {
  project: Project;
  tasks: Task[];
  onClose: () => void;
  onSelectTask: (id: string) => void;
}

type Line = { text: string; type: "system" | "input" | "error" | "success" | "table" | "info" };

const STATUS_MAP: Record<string, TaskStatus> = {
  backlog: "backlog", b: "backlog",
  todo: "todo", t: "todo",
  "in_progress": "in_progress", ip: "in_progress", progress: "in_progress", wip: "in_progress",
  review: "review", r: "review",
  done: "done", d: "done",
};

const PRIORITY_MAP: Record<string, TaskPriority> = {
  low: "low", l: "low",
  medium: "medium", m: "medium", med: "medium",
  high: "high", h: "high",
  urgent: "urgent", u: "urgent",
};

const TodoTerminal = ({ project, tasks, onClose, onSelectTask }: TodoTerminalProps) => {
  const [lines, setLines] = useState<Line[]>([
    { text: `┌────────────────────────────────────────────┐`, type: "info" },
    { text: `│  KANBAN TERMINAL — ${project.name.toUpperCase().padEnd(22)}│`, type: "info" },
    { text: `│  Type 'help' for available commands         │`, type: "info" },
    { text: `└────────────────────────────────────────────┘`, type: "info" },
    { text: "", type: "system" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const qc = useQueryClient();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [lines]);

  // keyboard shortcut to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const addLines = useCallback((...newLines: Line[]) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  const handleCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setHistory((prev) => [trimmed, ...prev].slice(0, 50));
    setHistoryIdx(-1);
    addLines({ text: `$ ${trimmed}`, type: "input" });

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case "help":
      case "h":
      case "?":
        addLines(
          { text: "", type: "system" },
          { text: "  COMMANDS:", type: "info" },
          { text: "  ls [status]         — List tasks (all, todo, wip, done...)", type: "system" },
          { text: "  add <title>         — Create a new task", type: "system" },
          { text: "  mv <#> <status>     — Move task to status (todo/wip/done/review/backlog)", type: "system" },
          { text: "  pri <#> <priority>  — Set priority (low/med/high/urgent)", type: "system" },
          { text: "  rm <#>              — Delete a task", type: "system" },
          { text: "  open <#>            — Open task detail", type: "system" },
          { text: "  stats               — Show project statistics", type: "system" },
          { text: "  clear               — Clear terminal", type: "system" },
          { text: "  exit / q            — Close terminal", type: "system" },
          { text: "", type: "system" },
          { text: "  <#> = task number from 'ls' output", type: "system" },
          { text: "", type: "system" },
        );
        break;

      case "ls":
      case "list": {
        const statusFilter = args[0] ? STATUS_MAP[args[0].toLowerCase()] : undefined;
        const filtered = statusFilter ? tasks.filter((t) => t.status === statusFilter) : tasks;
        if (filtered.length === 0) {
          addLines({ text: "  (no tasks found)", type: "system" });
        } else {
          addLines({ text: "", type: "system" });
          addLines({ text: `  #   STATUS        PRI     TITLE`, type: "info" });
          addLines({ text: `  ─── ───────────── ─────── ─────────────────────────────`, type: "system" });
          filtered.forEach((t, i) => {
            const idx = tasks.indexOf(t);
            const statusLabel = t.status.toUpperCase().replace("_", " ").padEnd(13);
            const priLabel = t.priority.toUpperCase().padEnd(7);
            const title = t.title.length > 30 ? t.title.slice(0, 30) + "…" : t.title;
            addLines({
              text: `  ${String(idx + 1).padStart(3)} ${statusLabel} ${priLabel} ${title}`,
              type: t.status === "done" ? "success" : t.status === "in_progress" ? "info" : "system",
            });
          });
          addLines({ text: "", type: "system" });
        }
        break;
      }

      case "add":
      case "new":
      case "create": {
        const title = args.join(" ");
        if (!title) {
          addLines({ text: "  ✗ Usage: add <task title>", type: "error" });
          break;
        }
        try {
          await createTask.mutateAsync({ title, project_id: project.id, status: "todo" });
          addLines({ text: `  ✓ Created: "${title}"`, type: "success" });
          qc.invalidateQueries({ queryKey: ["tasks", project.id] });
        } catch (e: any) {
          addLines({ text: `  ✗ ${e.message}`, type: "error" });
        }
        break;
      }

      case "mv":
      case "move": {
        const idx = parseInt(args[0]) - 1;
        const status = args[1] ? STATUS_MAP[args[1].toLowerCase()] : undefined;
        if (isNaN(idx) || idx < 0 || idx >= tasks.length || !status) {
          addLines({ text: "  ✗ Usage: mv <#> <status>  (e.g. mv 1 done)", type: "error" });
          break;
        }
        try {
          await updateTask.mutateAsync({ id: tasks[idx].id, status });
          addLines({ text: `  ✓ "${tasks[idx].title}" → ${status.toUpperCase()}`, type: "success" });
          qc.invalidateQueries({ queryKey: ["tasks", project.id] });
        } catch (e: any) {
          addLines({ text: `  ✗ ${e.message}`, type: "error" });
        }
        break;
      }

      case "pri":
      case "priority": {
        const idx = parseInt(args[0]) - 1;
        const priority = args[1] ? PRIORITY_MAP[args[1].toLowerCase()] : undefined;
        if (isNaN(idx) || idx < 0 || idx >= tasks.length || !priority) {
          addLines({ text: "  ✗ Usage: pri <#> <priority>  (e.g. pri 1 high)", type: "error" });
          break;
        }
        try {
          await updateTask.mutateAsync({ id: tasks[idx].id, priority });
          addLines({ text: `  ✓ "${tasks[idx].title}" priority → ${priority.toUpperCase()}`, type: "success" });
          qc.invalidateQueries({ queryKey: ["tasks", project.id] });
        } catch (e: any) {
          addLines({ text: `  ✗ ${e.message}`, type: "error" });
        }
        break;
      }

      case "rm":
      case "delete":
      case "del": {
        const idx = parseInt(args[0]) - 1;
        if (isNaN(idx) || idx < 0 || idx >= tasks.length) {
          addLines({ text: "  ✗ Usage: rm <#>", type: "error" });
          break;
        }
        try {
          await deleteTask.mutateAsync({ id: tasks[idx].id, projectId: project.id });
          addLines({ text: `  ✓ Deleted: "${tasks[idx].title}"`, type: "success" });
          qc.invalidateQueries({ queryKey: ["tasks", project.id] });
        } catch (e: any) {
          addLines({ text: `  ✗ ${e.message}`, type: "error" });
        }
        break;
      }

      case "open":
      case "view": {
        const idx = parseInt(args[0]) - 1;
        if (isNaN(idx) || idx < 0 || idx >= tasks.length) {
          addLines({ text: "  ✗ Usage: open <#>", type: "error" });
          break;
        }
        addLines({ text: `  ▸ Opening "${tasks[idx].title}"...`, type: "system" });
        onClose();
        setTimeout(() => onSelectTask(tasks[idx].id), 300);
        break;
      }

      case "stats": {
        const byStatus: Record<string, number> = {};
        const byPriority: Record<string, number> = {};
        tasks.forEach((t) => {
          byStatus[t.status] = (byStatus[t.status] || 0) + 1;
          byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
        });
        const doneCount = byStatus.done || 0;
        const pct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;
        const bar = "█".repeat(Math.round(pct / 5)) + "░".repeat(20 - Math.round(pct / 5));
        addLines(
          { text: "", type: "system" },
          { text: `  PROJECT: ${project.name}`, type: "info" },
          { text: `  TOTAL: ${tasks.length} tasks`, type: "system" },
          { text: "", type: "system" },
          { text: `  PROGRESS [${bar}] ${pct}%`, type: pct === 100 ? "success" : "info" },
          { text: "", type: "system" },
          { text: `  BY STATUS:`, type: "info" },
          ...Object.entries(byStatus).map(([s, c]) => ({
            text: `    ${s.toUpperCase().replace("_", " ").padEnd(14)} ${c}`,
            type: "system" as const,
          })),
          { text: "", type: "system" },
          { text: `  BY PRIORITY:`, type: "info" },
          ...Object.entries(byPriority).map(([p, c]) => ({
            text: `    ${p.toUpperCase().padEnd(14)} ${c}`,
            type: "system" as const,
          })),
          { text: "", type: "system" },
        );
        break;
      }

      case "clear":
      case "cls":
        setLines([]);
        break;

      case "exit":
      case "q":
      case "quit":
        onClose();
        break;

      default:
        addLines({ text: `  ✗ Unknown command: '${command}'. Type 'help' for usage.`, type: "error" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(next);
      if (history[next]) setInput(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = historyIdx - 1;
      if (next < 0) {
        setHistoryIdx(-1);
        setInput("");
      } else {
        setHistoryIdx(next);
        setInput(history[next]);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-[60] bg-background flex flex-col"
    >
      {/* Terminal title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex gap-1.5">
          <button onClick={onClose} className="w-3 h-3 rounded-full bg-destructive/70 hover:bg-destructive transition-colors" />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--accent-orange) / 0.7)" }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--accent-green) / 0.7)" }} />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs font-mono text-muted-foreground">
            kanban-terminal — {project.name} — {tasks.length} tasks
          </span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="flex-1 overflow-y-auto p-5 font-mono text-sm space-y-0.5 cursor-text"
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={
              line.type === "error" ? "text-destructive" :
              line.type === "success" ? "" :
              line.type === "input" ? "" :
              line.type === "info" ? "" :
              "text-muted-foreground"
            }
            style={
              line.type === "success" ? { color: "hsl(var(--accent-green))" } :
              line.type === "input" ? { color: "hsl(var(--accent-cyan))" } :
              line.type === "info" ? { color: "hsl(var(--accent-pop))" } :
              {}
            }
          >
            {line.text || "\u00A0"}
          </div>
        ))}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span style={{ color: "hsl(var(--accent-green))" }}>$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-foreground font-mono"
            style={{ caretColor: "hsl(var(--accent-green))" }}
            autoFocus
          />
        </form>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center justify-between text-xs font-mono text-muted-foreground">
        <span>ESC to close · ↑↓ history</span>
        <span>type <span style={{ color: "hsl(var(--accent-pop))" }}>help</span> for commands</span>
      </div>
    </motion.div>
  );
};

export default TodoTerminal;
