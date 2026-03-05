import { motion } from "framer-motion";
import { CheckSquare, Paperclip, Calendar, ChevronRight } from "lucide-react";
import type { Task } from "@/hooks/useTasks";
import type { ProjectStatus } from "@/hooks/useProjectStatuses";
import LinkText from "./LinkText";

interface TaskTimelineProps {
  tasks: Task[];
  statuses: ProjectStatus[];
  checklistCounts: Record<string, { total: number; done: number }>;
  attachmentCounts: Record<string, number>;
  onSelectTask: (id: string) => void;
}

const PRI_LABEL: Record<string, string> = {
  low: "P4", medium: "P3", high: "P2", urgent: "P1",
};

const TaskTimeline = ({ tasks, statuses, checklistCounts, attachmentCounts, onSelectTask }: TaskTimelineProps) => {
  const grouped = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    if (!acc[t.status]) acc[t.status] = [];
    acc[t.status].push(t);
    return acc;
  }, {});

  const activeStatuses = statuses.filter((s) => grouped[s.slug]?.length > 0);

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 md:px-8">
      {activeStatuses.map((status, sIdx) => {
        const statusTasks = grouped[status.slug];

        return (
          <div key={status.id} className="mb-8 last:mb-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: sIdx * 0.1 }}
              className="flex items-center gap-3 mb-4"
            >
              <motion.div
                className="w-3 h-3 rounded-full relative"
                style={{ backgroundColor: status.color }}
                animate={status.slug === "in_progress" ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {status.slug === "in_progress" && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: status.color }}
                    animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
              <span className="font-mono text-xs tracking-[0.3em] font-bold" style={{ color: status.color }}>
                {status.name.toUpperCase()}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">({statusTasks.length})</span>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${status.color}33, transparent)` }} />
            </motion.div>

            <div className="space-y-1 pl-1.5">
              <div className="border-l-2 pl-6 space-y-1" style={{ borderColor: `${status.color}33` }}>
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
                      <div
                        className="absolute -left-[31px] w-2.5 h-2.5 rounded-full border-2 bg-background group-hover:scale-125 transition-transform"
                        style={{ borderColor: status.color }}
                      />

                      <span className="text-xs w-5 text-center font-mono font-bold opacity-60 group-hover:opacity-100 transition-opacity">
                        {PRI_LABEL[task.priority] || "P3"}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium truncate ${status.slug === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            <LinkText text={task.title} />
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-md">
                            <LinkText text={task.description} />
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground shrink-0">
                        {progress !== null && (
                          <span className="flex items-center gap-1 font-mono">
                            <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: status.color }} />
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
