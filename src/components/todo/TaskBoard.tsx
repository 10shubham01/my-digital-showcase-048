import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Terminal as TerminalIcon, Clock } from "lucide-react";
import { useTasks, useCreateTask } from "@/hooks/useTasks";
import { useProjectStatuses } from "@/hooks/useProjectStatuses";
import type { Project } from "@/hooks/useProjects";
import TaskTimeline from "./TaskTimeline";
import TaskActivityTimeline from "./TaskActivityTimeline";
import TaskDetailSheet from "./TaskDetailSheet";
import TodoTerminal from "./TodoTerminal";
import FolderIcon from "./FolderIcon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface TaskBoardProps {
  project: Project;
  onSwitchProject?: (id: string) => void;
}

const TaskBoard = ({ project, onSwitchProject }: TaskBoardProps) => {
  const { data: tasks = [], isLoading } = useTasks(project.id);
  const { data: statuses = [] } = useProjectStatuses(project.id);
  const createTask = useCreateTask();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showTerminal, setShowTerminal] = useState(false);
  const [showAddPopover, setShowAddPopover] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [viewMode, setViewMode] = useState<"tasks" | "activity">("tasks");

  // Keyboard shortcut: Cmd+N to add, Cmd+T for terminal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        setShowAddPopover(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "t") {
        e.preventDefault();
        setShowTerminal(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

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
    tasks.forEach((t) => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return counts;
  }, [tasks]);

  const doneCount = useMemo(() => {
    const doneStatus = statuses.find((s) => s.slug === "done");
    return doneStatus ? (statusCounts[doneStatus.slug] || 0) : 0;
  }, [statuses, statusCounts]);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || createTask.isPending) return;
    const defaultStatus = filterStatus !== "all" ? filterStatus : (statuses[1]?.slug || statuses[0]?.slug || "todo");
    await createTask.mutateAsync({
      title: newTaskTitle.trim(),
      project_id: project.id,
      status: defaultStatus,
    });
    setNewTaskTitle("");
    setShowAddPopover(false);
  };

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-border flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <FolderIcon color={project.color} size={24} />
          <div>
            <h1 className="text-2xl font-semibold tracking-wide">{project.name}</h1>
            <p className="text-xs text-muted-foreground font-mono">{tasks.length} tasks · {doneCount} done</p>
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

          {/* View toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode(viewMode === "tasks" ? "activity" : "tasks")}
            className={`p-2 rounded-lg transition-colors ${viewMode === "activity" ? "bg-foreground text-background" : "bg-muted hover:bg-foreground hover:text-background"}`}
            title="Toggle activity timeline"
          >
            <Clock className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTerminal(true)}
            className="p-2 rounded-lg bg-muted hover:bg-foreground hover:text-background transition-colors"
            title="Open Terminal (⌘T)"
          >
            <TerminalIcon className="w-4 h-4" />
          </motion.button>

          <Popover open={showAddPopover} onOpenChange={setShowAddPopover}>
            <PopoverTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg text-background transition-colors"
                style={{ backgroundColor: "hsl(var(--accent-pop))" }}
                title="Add Task (⌘N)"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-3">
              <p className="text-xs font-mono text-muted-foreground mb-2">NEW TASK</p>
              <div className="space-y-2">
                <input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateTask();
                    if (e.key === "Escape") setShowAddPopover(false);
                  }}
                  placeholder="What needs to be done?"
                  className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring font-mono"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTask}
                    disabled={createTask.isPending || !newTaskTitle.trim()}
                    className="flex-1 bg-foreground text-background rounded-lg py-2 text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {createTask.isPending ? "Adding..." : "Add Task"}
                  </button>
                  <button onClick={() => setShowAddPopover(false)} className="px-3 text-xs text-muted-foreground">
                    ESC
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Status filter pills */}
      {viewMode === "tasks" && (
        <div className="px-6 py-3 flex gap-1.5 overflow-x-auto border-b border-border">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-all whitespace-nowrap ${
              filterStatus === "all" ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            ALL ({tasks.length})
          </motion.button>
          {statuses.map((s) => {
            const isActive = filterStatus === s.slug;
            return (
              <motion.button
                key={s.id}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterStatus(isActive ? "all" : s.slug)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all whitespace-nowrap ${
                  isActive ? "text-background" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
                style={isActive ? { backgroundColor: s.color } : {}}
              >
                {s.name.toUpperCase()} ({statusCounts[s.slug] || 0})
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === "activity" ? (
          <TaskActivityTimeline projectId={project.id} tasks={tasks} statuses={statuses} />
        ) : filteredTasks.length > 0 ? (
          <TaskTimeline
            tasks={filteredTasks}
            statuses={statuses}
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
            <h3 className="text-3xl font-semibold mb-2">Empty Slate</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              No tasks yet. Hit ⌘N or open the terminal.
            </p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddPopover(true)}
                className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium"
              >
                + New Task
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTerminal(true)}
                className="px-4 py-2 bg-muted rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                &gt;_ Terminal
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
          <TaskDetailSheet task={selectedTask} statuses={statuses} onClose={() => setSelectedTaskId(null)} />
        )}
      </AnimatePresence>

      {/* Fullscreen Terminal */}
      <AnimatePresence>
        {showTerminal && (
          <TodoTerminal
            project={project}
            tasks={tasks}
            statuses={statuses}
            onClose={() => setShowTerminal(false)}
            onSelectTask={setSelectedTaskId}
            onSwitchProject={onSwitchProject}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskBoard;
