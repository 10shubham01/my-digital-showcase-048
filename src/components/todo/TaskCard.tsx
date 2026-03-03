import { motion } from "framer-motion";
import { Calendar, CheckSquare, Paperclip, Flag, Clock } from "lucide-react";
import type { Task, TaskStatus, TaskPriority } from "@/hooks/useTasks";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  checklistCount?: { total: number; done: number };
  attachmentCount?: number;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; cssVar: string }> = {
  backlog: { label: "Backlog", color: "#6b7280", cssVar: "--muted-foreground" },
  todo: { label: "Todo", color: "#6366f1", cssVar: "--accent-pop" },
  in_progress: { label: "In Progress", color: "#06b6d4", cssVar: "--accent-cyan" },
  review: { label: "Review", color: "#f97316", cssVar: "--accent-orange" },
  done: { label: "Done", color: "#22c55e", cssVar: "--accent-green" },
};

const PRIORITY_CONFIG: Record<TaskPriority, { icon: string; color: string }> = {
  low: { icon: "↓", color: "#6b7280" },
  medium: { icon: "→", color: "#eab308" },
  high: { icon: "↑", color: "#f97316" },
  urgent: { icon: "⚡", color: "#ef4444" },
};

const TaskCard = ({ task, onClick, checklistCount, attachmentCount }: TaskCardProps) => {
  const status = STATUS_CONFIG[task.status];
  const priority = PRIORITY_CONFIG[task.priority];
  const progress = checklistCount && checklistCount.total > 0 
    ? Math.round((checklistCount.done / checklistCount.total) * 100) 
    : null;

  return (
    <motion.div
      layout
      whileHover={{ y: -2, boxShadow: "0 8px 30px -12px rgba(0,0,0,0.3)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-4 cursor-pointer group transition-colors hover:border-foreground/20"
    >
      {/* Status + Priority row */}
      <div className="flex items-center justify-between mb-3">
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
          style={{ backgroundColor: status.color + "18", color: status.color }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
          {status.label}
        </div>
        <span className="text-sm" style={{ color: priority.color }} title={task.priority}>
          {priority.icon}
        </span>
      </div>

      {/* Title */}
      <h4 className="font-medium text-sm text-foreground leading-snug mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
      )}

      {/* Progress bar */}
      {progress !== null && (
        <div className="mb-3">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full"
              style={{ backgroundColor: status.color }}
            />
          </div>
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        {checklistCount && checklistCount.total > 0 && (
          <span className="flex items-center gap-1">
            <CheckSquare className="w-3 h-3" /> {checklistCount.done}/{checklistCount.total}
          </span>
        )}
        {attachmentCount && attachmentCount > 0 && (
          <span className="flex items-center gap-1">
            <Paperclip className="w-3 h-3" /> {attachmentCount}
          </span>
        )}
        {task.due_date && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {new Date(task.due_date).toLocaleDateString("en", { month: "short", day: "numeric" })}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Clock className="w-3 h-3" />
          {new Date(task.updated_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
        </span>
      </div>
    </motion.div>
  );
};

export { STATUS_CONFIG, PRIORITY_CONFIG };
export default TaskCard;
