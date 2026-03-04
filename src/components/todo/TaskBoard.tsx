import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Terminal as TerminalIcon, Filter } from "lucide-react";
import { useTasks, useCreateTask, type TaskStatus, type TaskPriority } from "@/hooks/useTasks";
import { useChecklist, useAttachments } from "@/hooks/useTasks";
import type { Project } from "@/hooks/useProjects";
import TaskTimeline from "./TaskTimeline";
import TaskDetailSheet from "./TaskDetailSheet";
import TodoTerminal from "./TodoTerminal";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface TaskBoardProps {
  project: Project;
}

const STATUSES: TaskStatus[] = ["backlog", "todo", "in_progress", "review", "done"];

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog", todo: "Todo", in_progress: "In Progress", review: "Review", done: "Done",
};

const TaskBoard = ({ project }: TaskBoardProps) => {
  const { data: tasks = [], isLoading } = useTasks(project.id);
  const createTask = useCreateTask();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [showTerminal, setShowTerminal] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const { data: allChecklists = [] } = useQuery({
    queryKey: ["all-checklists", project.id],
    queryFn: async () => {
      const taskIds = tasks.map((t) => t.id);
      if (taskIds.length === 0) return [];
      const { data } = await supabase
        .from("task_checklist_items")
        .select("task_id, is_completed")
        .in("task_id", taskIds);
      return data || [];
    },
    enabled: tasks.length > 0,
  });

  const { data: allAttachments = [] } = useQuery({
    queryKey: ["all-attachments", project.id],
    queryFn: async () => {
      const taskIds = tasks.map((t) => t.id);
      if (taskIds.length === 0) return [];
      const { data } = await supabase
        .from("task_attachments")
        .select("task_id")
        .in("task_id", taskIds);
      return data || [];
    },
    enabled: tasks.length > 0,
  });

  const checklistCounts = useMemo(() => {
    const map: Record<string, { total: number; done: number }> = {};
    allChecklists.forEach((c: any) => {
      if (!map[c.task_id]) map[c.task_id] = { total: 0, done: 0 };
      map[c.task_id].total++;
      if (c.is_completed) map[c.task_id].done++;
    });
    return map;
  }, [allChecklists]);

  const attachmentCounts = useMemo(() => {
    const map: Record<string, number> = {};
    allAttachments.forEach((a: any) => {
      map[a.task_id] = (map[a.task_id] || 0) + 1;
    });
    return map;
  }, [allAttachments]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tasks, filterStatus, search]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tasks.length };
    tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return counts;
  }, [tasks]);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    await createTask.mutateAsync({
      title: newTaskTitle.trim(),
      project_id: project.id,
      status: filterStatus === "all" ? "todo" : filterStatus,
    });
    setNewTaskTitle("");
    setShowNewTask(false);
  };

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-border flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <motion.span 
            className="text-2xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
          >
            {project.icon}
          </motion.span>
          <div>
            <h1 className="font-heading text-2xl tracking-wider">{project.name}</h1>
            <p className="text-xs text-muted-foreground font-mono">{tasks.length} tasks · {statusCounts.done || 0} done</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-muted rounded-lg pl-8 pr-3 py-1.5 text-sm outline-none w-32 focus:w-48 transition-all focus:ring-1 focus:ring-ring font-mono"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTerminal(true)}
            className="p-2 rounded-lg bg-muted hover:bg-foreground hover:text-background transition-colors"
            title="Open Terminal (manage tasks via CLI)"
          >
            <TerminalIcon className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewTask(true)}
            className="p-2 rounded-lg text-background transition-colors"
            style={{ backgroundColor: "hsl(var(--accent-pop))" }}
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Status filter - horizontal scroll pills */}
      <div className="px-6 py-3 flex gap-1.5 overflow-x-auto border-b border-border">
        {(["all", ...STATUSES] as const).map((s) => {
          const isActive = filterStatus === s;
          return (
            <motion.button
              key={s}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterStatus(s === "all" ? "all" : (filterStatus === s ? "all" : s))}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all whitespace-nowrap ${
                isActive ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "ALL" : STATUS_LABELS[s].toUpperCase()} ({statusCounts[s] || 0})
            </motion.button>
          );
        })}
      </div>

      {/* Quick add */}
      <AnimatePresence>
        {showNewTask && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border"
          >
            <div className="px-6 py-3 flex items-center gap-3">
              <span className="text-muted-foreground font-mono text-sm">$</span>
              <input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateTask();
                  if (e.key === "Escape") setShowNewTask(false);
                }}
                placeholder="What needs to be done?"
                className="flex-1 bg-transparent outline-none font-mono text-sm"
                autoFocus
              />
              <button
                onClick={handleCreateTask}
                className="px-3 py-1 bg-foreground text-background rounded-lg text-xs font-mono"
              >
                ADD
              </button>
              <button
                onClick={() => setShowNewTask(false)}
                className="text-xs text-muted-foreground font-mono"
              >
                ESC
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline content */}
      <div className="flex-1 overflow-auto">
        {filteredTasks.length > 0 ? (
          <TaskTimeline
            tasks={filteredTasks}
            checklistCounts={checklistCounts}
            attachmentCounts={attachmentCounts}
            onSelectTask={setSelectedTaskId}
          />
        ) : tasks.length === 0 && !isLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center px-6"
          >
            <motion.span 
              className="text-6xl mb-4 block"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎯
            </motion.span>
            <h3 className="font-heading text-3xl mb-2">EMPTY SLATE</h3>
            <p className="text-muted-foreground text-sm font-mono mb-6 max-w-xs">
              No tasks yet. Create your first task or open the terminal with <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘T</kbd>
            </p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewTask(true)}
                className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-mono"
              >
                + NEW TASK
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTerminal(true)}
                className="px-4 py-2 bg-muted rounded-lg text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
              >
                &gt;_ TERMINAL
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">
            No matching tasks
          </div>
        )}
      </div>

      {/* Task detail sheet */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailSheet task={selectedTask} onClose={() => setSelectedTaskId(null)} />
        )}
      </AnimatePresence>

      {/* Fullscreen Terminal */}
      <AnimatePresence>
        {showTerminal && (
          <TodoTerminal
            project={project}
            tasks={tasks}
            onClose={() => setShowTerminal(false)}
            onSelectTask={setSelectedTaskId}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskBoard;
