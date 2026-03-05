import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Project } from "@/hooks/useProjects";
import type { Task, TaskPriority } from "@/hooks/useTasks";
import type { ProjectStatus } from "@/hooks/useProjectStatuses";
import { useCreateTask, useUpdateTask, useDeleteTask, useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useProjectStatuses } from "@/hooks/useProjectStatuses";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TodoTerminalProps {
  project: Project;
  tasks: Task[];
  statuses: ProjectStatus[];
  onClose: () => void;
  onSelectTask: (id: string) => void;
  onSwitchProject?: (id: string) => void;
}

type Line = { text: string; type: "system" | "input" | "error" | "success" | "table" | "info" };

const PRIORITY_MAP: Record<string, TaskPriority> = {
  low: "low", l: "low", p4: "low", "4": "low",
  medium: "medium", m: "medium", med: "medium", p3: "medium", "3": "medium",
  high: "high", h: "high", p2: "high", "2": "high",
  urgent: "urgent", u: "urgent", p1: "urgent", "1": "urgent",
};

const PRI_LABEL: Record<string, string> = {
  low: "P4", medium: "P3", high: "P2", urgent: "P1",
};

const TodoTerminal = ({ project: initialProject, tasks: initialTasks, statuses: initialStatuses, onClose, onSelectTask, onSwitchProject }: TodoTerminalProps) => {
  const { data: allProjects = [] } = useProjects();
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(initialProject.id);
  const currentProject = allProjects.find((p) => p.id === currentProjectId) || initialProject;
  const { data: currentTasks = [] } = useTasks(currentProjectId);
  const { data: currentStatuses = [] } = useProjectStatuses(currentProjectId);

  const tasks = currentProjectId === initialProject.id ? (currentTasks.length > 0 ? currentTasks : initialTasks) : currentTasks;
  const statuses = currentProjectId === initialProject.id ? (currentStatuses.length > 0 ? currentStatuses : initialStatuses) : currentStatuses;

  const statusMap = useCallback(() => {
    const map: Record<string, string> = {};
    statuses.forEach((s) => {
      map[s.slug] = s.slug;
      map[s.name.toLowerCase()] = s.slug;
      if (s.slug === "in_progress") { map.ip = s.slug; map.wip = s.slug; map.progress = s.slug; }
      if (s.slug === "backlog") map.b = s.slug;
      if (s.slug === "todo") map.t = s.slug;
      if (s.slug === "review") map.r = s.slug;
      if (s.slug === "done") map.d = s.slug;
    });
    return map;
  }, [statuses]);

  const [lines, setLines] = useState<Line[]>([
    { text: `┌────────────────────────────────────────────┐`, type: "info" },
    { text: `│  KANBAN TERMINAL v2.0                      │`, type: "info" },
    { text: `│  Type 'help' for commands · 'cd' to nav    │`, type: "info" },
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

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [lines]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const addLines = useCallback((...newLines: Line[]) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  const prompt = currentProjectId ? `${currentProject.name}` : "~";

  const handleCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setHistory((prev) => [trimmed, ...prev].slice(0, 50));
    setHistoryIdx(-1);
    addLines({ text: `${prompt} $ ${trimmed}`, type: "input" });

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    const sMap = statusMap();

    switch (command) {
      case "help": case "h": case "?":
        addLines(
          { text: "", type: "system" },
          { text: "  NAVIGATION:", type: "info" },
          { text: "  cd <project>        — Switch to project (name or #)", type: "system" },
          { text: "  cd ..               — Go to root (project list)", type: "system" },
          { text: "  ls                  — List projects (root) or tasks (in project)", type: "system" },
          { text: "", type: "system" },
          { text: "  TASK OPERATIONS:", type: "info" },
          { text: "  add <title>         — Create a new task", type: "system" },
          { text: "  mv <#|*> <status>   — Move task(s) to status (* = all)", type: "system" },
          { text: "  pri <#|*> <P1-P4>   — Set priority (P1=urgent..P4=low)", type: "system" },
          { text: "  rm <#>              — Delete a task", type: "system" },
          { text: "  open <#>            — Open task detail", type: "system" },
          { text: "  stats               — Show project statistics", type: "system" },
          { text: "  statuses            — List available buckets", type: "system" },
          { text: "", type: "system" },
          { text: "  ACCOUNT:", type: "info" },
          { text: "  passwd              — Change password", type: "system" },
          { text: "  clear / exit        — Clear or close terminal", type: "system" },
          { text: "", type: "system" },
        );
        break;

      case "cd": {
        if (!args[0] || args[0] === ".." || args[0] === "/") {
          setCurrentProjectId(null);
          addLines({ text: "  ▸ At root. Type 'ls' to see projects.", type: "success" });
        } else {
          const query = args.join(" ").toLowerCase();
          const idx = parseInt(query) - 1;
          const found = !isNaN(idx)
            ? allProjects[idx]
            : allProjects.find((p) => p.name.toLowerCase().includes(query));
          if (found) {
            setCurrentProjectId(found.id);
            onSwitchProject?.(found.id);
            addLines({ text: `  ▸ Switched to "${found.name}"`, type: "success" });
          } else {
            addLines({ text: `  ✗ Project not found: "${query}"`, type: "error" });
          }
        }
        break;
      }

      case "ls": case "list": {
        if (!currentProjectId) {
          // Root level - list projects
          if (allProjects.length === 0) {
            addLines({ text: "  (no projects)", type: "system" });
          } else {
            addLines({ text: "", type: "system" }, { text: `  #   PROJECT`, type: "info" });
            addLines({ text: `  ─── ──────────────────────────────`, type: "system" });
            allProjects.forEach((p, i) => {
              addLines({ text: `  ${String(i + 1).padStart(3)} 📁 ${p.name}`, type: "system" });
            });
            addLines({ text: "", type: "system" }, { text: "  Use 'cd <#>' to enter a project", type: "info" });
          }
        } else {
          const statusFilter = args[0] ? sMap[args[0].toLowerCase()] : undefined;
          const filtered = statusFilter ? tasks.filter((t) => t.status === statusFilter) : tasks;
          if (filtered.length === 0) {
            addLines({ text: "  (no tasks found)", type: "system" });
          } else {
            addLines({ text: "", type: "system" });
            addLines({ text: `  #   STATUS        PRI  TITLE`, type: "info" });
            addLines({ text: `  ─── ───────────── ──── ─────────────────────────────`, type: "system" });
            filtered.forEach((t) => {
              const idx = tasks.indexOf(t);
              const statusLabel = t.status.toUpperCase().replace("_", " ").padEnd(13);
              const priLabel = (PRI_LABEL[t.priority] || "P3").padEnd(4);
              const title = t.title.length > 30 ? t.title.slice(0, 30) + "…" : t.title;
              const isDone = t.status === "done";
              addLines({
                text: `  ${String(idx + 1).padStart(3)} ${statusLabel} ${priLabel} ${title}`,
                type: isDone ? "success" : "system",
              });
            });
            addLines({ text: "", type: "system" });
          }
        }
        break;
      }

      case "add": case "new": case "create": {
        if (!currentProjectId) { addLines({ text: "  ✗ cd into a project first", type: "error" }); break; }
        const title = args.join(" ");
        if (!title) { addLines({ text: "  ✗ Usage: add <task title>", type: "error" }); break; }
        try {
          const defaultStatus = statuses[1]?.slug || statuses[0]?.slug || "todo";
          await createTask.mutateAsync({ title, project_id: currentProjectId, status: defaultStatus });
          addLines({ text: `  ✓ Created: "${title}"`, type: "success" });
          qc.invalidateQueries({ queryKey: ["tasks", currentProjectId] });
        } catch (e: any) { addLines({ text: `  ✗ ${e.message}`, type: "error" }); }
        break;
      }

      case "mv": case "move": {
        if (!currentProjectId) { addLines({ text: "  ✗ cd into a project first", type: "error" }); break; }
        const target = args[0];
        const status = args[1] ? sMap[args[1].toLowerCase()] : undefined;
        if (!target || !status) {
          addLines({ text: "  ✗ Usage: mv <#|*> <status>", type: "error" }); break;
        }
        try {
          if (target === "*" || target === "all") {
            let count = 0;
            for (const t of tasks) {
              if (t.status !== status) {
                await updateTask.mutateAsync({ id: t.id, status });
                count++;
              }
            }
            addLines({ text: `  ✓ Moved ${count} tasks → ${status.toUpperCase()}`, type: "success" });
          } else {
            const idx = parseInt(target) - 1;
            if (isNaN(idx) || idx < 0 || idx >= tasks.length) {
              addLines({ text: "  ✗ Invalid task number", type: "error" }); break;
            }
            await updateTask.mutateAsync({ id: tasks[idx].id, status });
            addLines({ text: `  ✓ "${tasks[idx].title}" → ${status.toUpperCase()}`, type: "success" });
          }
          qc.invalidateQueries({ queryKey: ["tasks", currentProjectId] });
        } catch (e: any) { addLines({ text: `  ✗ ${e.message}`, type: "error" }); }
        break;
      }

      case "pri": case "priority": {
        if (!currentProjectId) { addLines({ text: "  ✗ cd into a project first", type: "error" }); break; }
        const target = args[0];
        const priority = args[1] ? PRIORITY_MAP[args[1].toLowerCase()] : undefined;
        if (!target || !priority) {
          addLines({ text: "  ✗ Usage: pri <#|*> <P1-P4>", type: "error" }); break;
        }
        try {
          if (target === "*" || target === "all") {
            let count = 0;
            for (const t of tasks) {
              if (t.priority !== priority) {
                await updateTask.mutateAsync({ id: t.id, priority });
                count++;
              }
            }
            addLines({ text: `  ✓ Set ${count} tasks → ${PRI_LABEL[priority]}`, type: "success" });
          } else {
            const idx = parseInt(target) - 1;
            if (isNaN(idx) || idx < 0 || idx >= tasks.length) {
              addLines({ text: "  ✗ Invalid task number", type: "error" }); break;
            }
            await updateTask.mutateAsync({ id: tasks[idx].id, priority });
            addLines({ text: `  ✓ "${tasks[idx].title}" → ${PRI_LABEL[priority]}`, type: "success" });
          }
          qc.invalidateQueries({ queryKey: ["tasks", currentProjectId] });
        } catch (e: any) { addLines({ text: `  ✗ ${e.message}`, type: "error" }); }
        break;
      }

      case "rm": case "delete": case "del": {
        if (!currentProjectId) { addLines({ text: "  ✗ cd into a project first", type: "error" }); break; }
        const idx = parseInt(args[0]) - 1;
        if (isNaN(idx) || idx < 0 || idx >= tasks.length) {
          addLines({ text: "  ✗ Usage: rm <#>", type: "error" }); break;
        }
        try {
          await deleteTask.mutateAsync({ id: tasks[idx].id, projectId: currentProjectId });
          addLines({ text: `  ✓ Deleted: "${tasks[idx].title}"`, type: "success" });
          qc.invalidateQueries({ queryKey: ["tasks", currentProjectId] });
        } catch (e: any) { addLines({ text: `  ✗ ${e.message}`, type: "error" }); }
        break;
      }

      case "open": case "view": {
        if (!currentProjectId) { addLines({ text: "  ✗ cd into a project first", type: "error" }); break; }
        const idx = parseInt(args[0]) - 1;
        if (isNaN(idx) || idx < 0 || idx >= tasks.length) {
          addLines({ text: "  ✗ Usage: open <#>", type: "error" }); break;
        }
        addLines({ text: `  ▸ Opening "${tasks[idx].title}"...`, type: "system" });
        if (currentProjectId !== initialProject.id) onSwitchProject?.(currentProjectId);
        onClose();
        setTimeout(() => onSelectTask(tasks[idx].id), 300);
        break;
      }

      case "statuses": {
        if (!currentProjectId) { addLines({ text: "  ✗ cd into a project first", type: "error" }); break; }
        addLines({ text: "", type: "system" }, { text: "  AVAILABLE STATUSES:", type: "info" });
        statuses.forEach((s) => {
          addLines({ text: `    ● ${s.name.padEnd(16)} (slug: ${s.slug})`, type: "system" });
        });
        addLines({ text: "", type: "system" });
        break;
      }

      case "stats": {
        if (!currentProjectId) { addLines({ text: "  ✗ cd into a project first", type: "error" }); break; }
        const byStatus: Record<string, number> = {};
        tasks.forEach((t) => { byStatus[t.status] = (byStatus[t.status] || 0) + 1; });
        const doneCount = byStatus.done || 0;
        const pct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;
        const bar = "█".repeat(Math.round(pct / 5)) + "░".repeat(20 - Math.round(pct / 5));
        addLines(
          { text: "", type: "system" },
          { text: `  PROJECT: ${currentProject.name}`, type: "info" },
          { text: `  TOTAL: ${tasks.length} tasks`, type: "system" },
          { text: `  PROGRESS [${bar}] ${pct}%`, type: pct === 100 ? "success" : "info" },
          { text: "", type: "system" },
          { text: `  BY STATUS:`, type: "info" },
          ...Object.entries(byStatus).map(([s, c]) => ({
            text: `    ${s.toUpperCase().replace("_", " ").padEnd(14)} ${c}`,
            type: "system" as const,
          })),
          { text: "", type: "system" },
        );
        break;
      }

      case "passwd": case "password": {
        addLines({ text: "  ▸ Sending password reset email...", type: "system" });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user?.email) throw new Error("No email found");
          const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: `${window.location.origin}/todo`,
          });
          if (error) throw error;
          addLines({ text: `  ✓ Reset link sent to ${user.email}`, type: "success" });
        } catch (e: any) { addLines({ text: `  ✗ ${e.message}`, type: "error" }); }
        break;
      }

      case "clear": case "cls": setLines([]); break;
      case "exit": case "q": case "quit": onClose(); break;
      default: addLines({ text: `  ✗ Unknown command: '${command}'. Type 'help'.`, type: "error" });
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
      if (next < 0) { setHistoryIdx(-1); setInput(""); }
      else { setHistoryIdx(next); setInput(history[next]); }
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
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex gap-1.5">
          <button onClick={onClose} className="w-3 h-3 rounded-full bg-destructive/70 hover:bg-destructive transition-colors" />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--accent-orange) / 0.7)" }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--accent-green) / 0.7)" }} />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs font-mono text-muted-foreground">
            kanban-terminal — {currentProjectId ? currentProject.name : "root"} — {tasks.length} tasks
          </span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="flex-1 overflow-y-auto p-5 font-mono text-sm space-y-0.5 cursor-text"
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={line.type === "error" ? "text-destructive" : line.type === "system" ? "text-muted-foreground" : ""}
            style={
              line.type === "success" ? { color: "hsl(var(--accent-green))" } :
              line.type === "input" ? { color: "hsl(var(--accent-cyan))" } :
              line.type === "info" ? { color: "hsl(var(--accent-pop))" } : {}
            }
          >
            {line.text || "\u00A0"}
          </div>
        ))}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">{prompt}</span>
          <span style={{ color: "hsl(var(--accent-green))" }}>$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-foreground font-mono border-none"
            style={{ caretColor: "hsl(var(--accent-green))" }}
            autoFocus
          />
        </form>
      </div>

      <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center justify-between text-xs font-mono text-muted-foreground">
        <span>ESC to close · ↑↓ history</span>
        <span>type <span style={{ color: "hsl(var(--accent-pop))" }}>help</span> for commands</span>
      </div>
    </motion.div>
  );
};

export default TodoTerminal;
