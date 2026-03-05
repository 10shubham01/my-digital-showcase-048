import { motion } from "framer-motion";
import { Plus, ArrowRight, Zap, Clock, Tag } from "lucide-react";
import { useTaskActivity, type TaskActivity } from "@/hooks/useTaskActivity";
import type { Task } from "@/hooks/useTasks";
import type { ProjectStatus } from "@/hooks/useProjectStatuses";

interface TaskActivityTimelineProps {
  projectId: string;
  tasks: Task[];
  statuses: ProjectStatus[];
}

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  created: { icon: <Plus className="w-3.5 h-3.5" />, label: "Created", color: "#22c55e" },
  status_changed: { icon: <ArrowRight className="w-3.5 h-3.5" />, label: "Moved", color: "#06b6d4" },
  priority_changed: { icon: <Zap className="w-3.5 h-3.5" />, label: "Priority", color: "#f97316" },
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "P4", medium: "P3", high: "P2", urgent: "P1",
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
};

const TaskActivityTimeline = ({ projectId, tasks, statuses }: TaskActivityTimelineProps) => {
  const { data: activities = [], isLoading } = useTaskActivity(projectId);
  const statusMap = new Map(statuses.map((s) => [s.slug, s]));
  const taskMap = new Map(tasks.map((t) => [t.id, t]));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-muted"
          style={{ borderTopColor: "hsl(var(--accent-pop))" }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Clock className="w-8 h-8 mb-3 opacity-40" />
        <p className="text-sm font-mono">No activity yet</p>
        <p className="text-xs mt-1">Create or move tasks to see the timeline</p>
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, TaskActivity[]> = {};
  activities.forEach((a) => {
    const dateKey = new Date(a.created_at).toLocaleDateString("en", {
      weekday: "short", month: "short", day: "numeric",
    });
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(a);
  });

  return (
    <div className="max-w-2xl mx-auto py-8 px-6">
      {Object.entries(grouped).map(([dateKey, items], groupIdx) => (
        <div key={dateKey} className="mb-8 last:mb-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: groupIdx * 0.1 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="w-2 h-2 rounded-full bg-foreground/30" />
            <span className="text-xs font-mono tracking-[0.2em] text-muted-foreground font-bold">
              {dateKey.toUpperCase()}
            </span>
            <div className="flex-1 h-px bg-border" />
          </motion.div>

          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gradient-to-b from-border via-border to-transparent" />

            {items.map((activity, idx) => {
              const config = ACTION_CONFIG[activity.action] || {
                icon: <Tag className="w-3.5 h-3.5" />,
                label: activity.action,
                color: "#6b7280",
              };
              const task = taskMap.get(activity.task_id);
              const oldStatus = activity.old_value ? statusMap.get(activity.old_value) : null;
              const newStatus = activity.new_value ? statusMap.get(activity.new_value) : null;

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 15, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: groupIdx * 0.1 + idx * 0.05,
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                  className="relative mb-4 last:mb-0"
                >
                  {/* Dot */}
                  <motion.div
                    className="absolute -left-[21px] top-3 w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 bg-background"
                    style={{ borderColor: config.color }}
                    whileHover={{ scale: 1.2 }}
                  >
                    <span style={{ color: config.color }}>{config.icon}</span>
                  </motion.div>

                  {/* Card */}
                  <motion.div
                    className="rounded-xl border border-border/50 bg-card/50 p-4 hover:bg-muted/30 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: config.color + "20", color: config.color }}
                          >
                            {config.label.toUpperCase()}
                          </span>
                          {task && (
                            <span className="text-sm font-medium truncate">{task.title}</span>
                          )}
                          {!task && activity.new_value && activity.action === "created" && (
                            <span className="text-sm font-medium truncate">{activity.new_value}</span>
                          )}
                        </div>

                        {activity.action === "status_changed" && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-mono"
                              style={{
                                backgroundColor: (oldStatus?.color || "#6b7280") + "18",
                                color: oldStatus?.color || "#6b7280",
                              }}
                            >
                              {oldStatus?.name || activity.old_value}
                            </span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-mono"
                              style={{
                                backgroundColor: (newStatus?.color || "#6b7280") + "18",
                                color: newStatus?.color || "#6b7280",
                              }}
                            >
                              {newStatus?.name || activity.new_value}
                            </span>
                          </div>
                        )}

                        {activity.action === "priority_changed" && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs font-mono text-muted-foreground">
                              {PRIORITY_LABELS[activity.old_value || ""] || activity.old_value}
                            </span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs font-mono font-bold text-foreground">
                              {PRIORITY_LABELS[activity.new_value || ""] || activity.new_value}
                            </span>
                          </div>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap mt-0.5">
                        {formatTime(activity.created_at)}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskActivityTimeline;
