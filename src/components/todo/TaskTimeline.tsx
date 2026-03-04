import { motion } from "framer-motion";
import { CheckSquare, Paperclip, Calendar, Flag, ChevronRight, Clock } from "lucide-react";
import type { Task, TaskStatus, TaskPriority } from "@/hooks/useTasks";

interface TaskTimelineProps {
  tasks: Task[];
  checklistCounts: Record<string, { total: number; done: number }>;
  attachmentCounts: Record<string, number>;
  onSelectTask: (id: string) => void;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; glow: string }> = {
  backlog: { label: "BACKLOG", color: "hsl(var(--muted-foreground))", glow: "hsl(var(--muted-foreground) / 0.2)" },
  todo: { label: "TODO", color: "hsl(var(--accent-pop))", glow: "hsl(var(--accent-pop) / 0.2)" },
  in_progress: { label: "IN PROGRESS", color: "hsl(var(--accent-cyan))", glow: "hsl(var(--accent-cyan) / 0.2)" },
  review: { label: "REVIEW", color: "hsl(var(--accent-orange))", glow: "hsl(var(--accent-orange) / 0.2)" },
  done: { label: "DONE", color: "hsl(var(--accent-green))", glow: "hsl(var(--accent-green) / 0.2)" },
};

const PRIORITY_ICON: Record<TaskPriority, string> = {
  low: "↓", medium: "→", high: "↑", urgent: "⚡",
};

const TaskTimeline = ({ tasks, checklistCounts, attachmentCounts, onSelectTask }: TaskTimelineProps) => {
  // Group by status for section headers
  const grouped = tasks.reduce<Record<TaskStatus, Task[]>>((acc, t) => {
    if (!acc[t.status]) acc[t.status] = [];
    acc[t.status].push(t);
    return acc;
  }, {} as any);

  const statusOrder: TaskStatus[] = ["in_progress", "todo", "review", "backlog", "done"];
  const activeStatuses = statusOrder.filter((s) => grouped[s]?.length > 0);

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 md:px-8">
      {activeStatuses.map((status, sIdx) => {
        const config = STATUS_CONFIG[status];
        const statusTasks = grouped[status];

        return (
          <div key={status} className="mb-8 last:mb-0">
            {/* Status section header */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: sIdx * 0.1 }}
              className="flex items-center gap-3 mb-4"
            >
              <motion.div
                className="w-3 h-3 rounded-full relative"
                style={{ backgroundColor: config.color }}
                animate={status === "in_progress" ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {status === "in_progress" && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: config.color }}
                    animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
              <span className="font-mono text-xs tracking-[0.3em] font-bold" style={{ color: config.color }}>
                {config.label}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">({statusTasks.length})</span>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${config.glow}, transparent)` }} />
            </motion.div>

            {/* Task rows */}
            <div className="space-y-1 pl-1.5">
              <div className="border-l-2 pl-6 space-y-1" style={{ borderColor: config.glow }}>
                {statusTasks.map((task, tIdx) => {
                  const checklist = checklistCounts[task.id];
                  const attachCount = attachmentCounts[task.id];
                  const progress = checklist && checklist.total > 0
                    ? Math.round((checklist.done / checklist.total) * 100)
                    : null;

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: sIdx * 0.1 + tIdx * 0.03 }}
                      whileHover={{ x: 4 }}
                      onClick={() => onSelectTask(task.id)}
                      className="group relative flex items-center gap-4 py-3 px-4 rounded-lg cursor-pointer transition-colors hover:bg-muted/50"
                    >
                      {/* Timeline dot */}
                      <div
                        className="absolute -left-[31px] w-2.5 h-2.5 rounded-full border-2 bg-background group-hover:scale-125 transition-transform"
                        style={{ borderColor: config.color }}
                      />

                      {/* Priority indicator */}
                      <span className="text-sm w-5 text-center font-mono opacity-50 group-hover:opacity-100 transition-opacity">
                        {PRIORITY_ICON[task.priority]}
                      </span>

                      {/* Task content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium truncate ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {task.title}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-md">{task.description}</p>
                        )}
                      </div>

                      {/* Meta badges */}
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground shrink-0">
                        {progress !== null && (
                          <span className="flex items-center gap-1 font-mono">
                            <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: config.color }} />
                            </div>
                            {progress}%
                          </span>
                        )}
                        {checklist && checklist.total > 0 && (
                          <span className="flex items-center gap-0.5">
                            <CheckSquare className="w-3 h-3" /> {checklist.done}/{checklist.total}
                          </span>
                        )}
                        {attachCount && attachCount > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Paperclip className="w-3 h-3" /> {attachCount}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>

                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskTimeline;
