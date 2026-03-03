import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { useTasks, useCreateTask, type TaskStatus, type TaskPriority } from "@/hooks/useTasks";
import { useChecklist, useAttachments } from "@/hooks/useTasks";
import type { Project } from "@/hooks/useProjects";
import TaskCard, { STATUS_CONFIG } from "./TaskCard";
import TaskDetailSheet from "./TaskDetailSheet";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface TaskBoardProps {
  project: Project;
}

type ViewMode = "board" | "grid";
type GroupBy = "status" | "priority" | "none";

const STATUSES: TaskStatus[] = ["backlog", "todo", "in_progress", "review", "done"];

const TaskBoard = ({ project }: TaskBoardProps) => {
  const { data: tasks = [], isLoading } = useTasks(project.id);
  const createTask = useCreateTask();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [showNewTask, setShowNewTask] = useState<TaskStatus | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Fetch all checklists & attachments counts
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

  const groupedByStatus = useMemo(() => {
    const groups: Record<TaskStatus, typeof tasks> = {
      backlog: [], todo: [], in_progress: [], review: [], done: [],
    };
    filteredTasks.forEach((t) => groups[t.status].push(t));
    return groups;
  }, [filteredTasks]);

  const handleCreateTask = async (status: TaskStatus) => {
    if (!newTaskTitle.trim()) return;
    await createTask.mutateAsync({
      title: newTaskTitle.trim(),
      project_id: project.id,
      status,
    });
    setNewTaskTitle("");
    setShowNewTask(null);
  };

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tasks.length };
    tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return counts;
  }, [tasks]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-border flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{project.icon}</span>
          <div>
            <h1 className="font-heading text-2xl tracking-wider">{project.name}</h1>
            <p className="text-xs text-muted-foreground">{tasks.length} tasks</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="bg-muted rounded-lg pl-8 pr-3 py-1.5 text-sm outline-none w-40 focus:w-56 transition-all focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* View toggle */}
          <div className="flex bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("board")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "board" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="px-6 py-3 flex gap-1.5 overflow-x-auto border-b border-border">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
            filterStatus === "all" ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          All ({statusCounts.all || 0})
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              filterStatus === s ? "ring-1 ring-foreground/30" : "opacity-60 hover:opacity-100"
            }`}
            style={{
              backgroundColor: STATUS_CONFIG[s].color + "18",
              color: STATUS_CONFIG[s].color,
            }}
          >
            {STATUS_CONFIG[s].label} ({statusCounts[s] || 0})
          </button>
        ))}
      </div>

      {/* Board content */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === "board" ? (
          <div className="flex gap-4 h-full min-w-max">
            {STATUSES.map((status) => (
              <div
                key={status}
                className="w-72 flex-shrink-0 flex flex-col"
              >
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_CONFIG[status].color }} />
                  <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {STATUS_CONFIG[status].label}
                  </span>
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
                    {groupedByStatus[status].length}
                  </span>
                  <button
                    onClick={() => {
                      setShowNewTask(status);
                      setNewTaskTitle("");
                    }}
                    className="ml-auto text-muted-foreground hover:text-foreground p-0.5"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Cards */}
                <div className="space-y-2 flex-1 overflow-y-auto pb-4">
                  <AnimatePresence>
                    {showNewTask === status && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-card border border-border rounded-xl p-3 space-y-2">
                          <input
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleCreateTask(status);
                              if (e.key === "Escape") setShowNewTask(null);
                            }}
                            placeholder="Task title..."
                            className="w-full bg-transparent text-sm outline-none"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCreateTask(status)}
                              className="px-3 py-1 bg-foreground text-background rounded-lg text-xs font-medium"
                            >
                              Create
                            </button>
                            <button
                              onClick={() => setShowNewTask(null)}
                              className="px-3 py-1 text-xs text-muted-foreground"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {groupedByStatus[status].map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => setSelectedTaskId(task.id)}
                      checklistCount={checklistCounts[task.id]}
                      attachmentCount={attachmentCounts[task.id]}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Grid view */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => setSelectedTaskId(task.id)}
                checklistCount={checklistCounts[task.id]}
                attachmentCount={attachmentCounts[task.id]}
              />
            ))}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowNewTask("todo")}
              className="border-2 border-dashed border-border rounded-xl p-6 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors min-h-[120px]"
            >
              <Plus className="w-5 h-5" /> Add Task
            </motion.button>
          </div>
        )}

        {/* Empty state */}
        {tasks.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <span className="text-6xl mb-4">🎯</span>
            <h3 className="font-heading text-2xl mb-2">No tasks yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Create your first task to get started</p>
            <button
              onClick={() => setShowNewTask("todo")}
              className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4 inline mr-1" /> Create Task
            </button>
          </motion.div>
        )}
      </div>

      {/* Task detail sheet */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailSheet task={selectedTask} onClose={() => setSelectedTaskId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskBoard;
