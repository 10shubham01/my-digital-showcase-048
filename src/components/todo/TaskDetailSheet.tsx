import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Paperclip, Check, Upload, FileText, Image as ImageIcon, Download } from "lucide-react";
import {
  useChecklist, useAddChecklistItem, useToggleChecklistItem, useDeleteChecklistItem,
  useAttachments, useUploadAttachment, useDeleteAttachment,
  useUpdateTask, useDeleteTask,
  type Task, type TaskPriority,
} from "@/hooks/useTasks";
import type { ProjectStatus } from "@/hooks/useProjectStatuses";

interface TaskDetailSheetProps {
  task: Task;
  statuses: ProjectStatus[];
  onClose: () => void;
}

const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];
const PRIORITY_CONFIG: Record<TaskPriority, { icon: string }> = {
  low: { icon: "↓" }, medium: { icon: "→" }, high: { icon: "↑" }, urgent: { icon: "⚡" },
};

const TaskDetailSheet = ({ task, statuses, onClose }: TaskDetailSheetProps) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [newCheckItem, setNewCheckItem] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: checklist = [] } = useChecklist(task.id);
  const addCheckItem = useAddChecklistItem();
  const toggleCheckItem = useToggleChecklistItem();
  const deleteCheckItem = useDeleteChecklistItem();
  const { data: attachments = [] } = useAttachments(task.id);
  const uploadAttachment = useUploadAttachment();
  const deleteAttachment = useDeleteAttachment();

  const currentStatus = statuses.find((s) => s.slug === task.status);

  const saveField = (field: string, value: any) => {
    updateTask.mutate({ id: task.id, [field]: value } as any);
  };

  const handleAddCheckItem = () => {
    if (!newCheckItem.trim()) return;
    addCheckItem.mutate({ task_id: task.id, text: newCheckItem.trim() });
    setNewCheckItem("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      uploadAttachment.mutate({ task_id: task.id, file });
    });
    e.target.value = "";
  };

  const completedCount = checklist.filter((c) => c.is_completed).length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-background border-l border-border overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentStatus?.color || "#6b7280" }}
            />
            <span className="text-xs font-mono text-muted-foreground">
              {task.id.slice(0, 8)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm("Delete this task?")) {
                  deleteTask.mutate({ id: task.id, projectId: task.project_id });
                  onClose();
                }
              }}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title !== task.title && saveField("title", title)}
            className="w-full text-xl font-semibold tracking-wide bg-transparent outline-none border-none"
          />

          {/* Status - dynamic from project statuses */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Status</label>
            <div className="flex flex-wrap gap-1.5">
              {statuses.map((s) => (
                <button
                  key={s.id}
                  onClick={() => saveField("status", s.slug)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    task.status === s.slug ? "ring-1 ring-foreground/30" : "opacity-50 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: s.color + "18",
                    color: s.color,
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Priority</label>
            <div className="flex gap-1.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => saveField("priority", p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                    task.priority === p ? "bg-muted ring-1 ring-foreground/20 text-foreground" : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {PRIORITY_CONFIG[p].icon} {p}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Due Date</label>
            <input
              type="date"
              value={task.due_date || ""}
              onChange={(e) => saveField("due_date", e.target.value || null)}
              className="bg-muted rounded-lg px-3 py-2.5 text-sm outline-none w-full border-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => description !== (task.description || "") && saveField("description", description)}
              placeholder="Add a description..."
              rows={4}
              className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none resize-none border-none"
            />
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Checklist {checklist.length > 0 && `(${completedCount}/${checklist.length})`}
              </label>
            </div>

            {checklist.length > 0 && (
              <div className="h-1 bg-muted rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0}%`,
                    backgroundColor: "hsl(var(--accent-green))",
                  }}
                />
              </div>
            )}

            <div className="space-y-1">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <button
                    onClick={() => toggleCheckItem.mutate({ id: item.id, is_completed: !item.is_completed, task_id: task.id })}
                    className={`w-4 h-4 rounded flex items-center justify-center transition-colors flex-shrink-0 ${
                      item.is_completed ? "" : "border border-border hover:border-foreground/40"
                    }`}
                    style={item.is_completed ? { backgroundColor: "hsl(var(--accent-green))" } : {}}
                  >
                    {item.is_completed && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className={`text-sm flex-1 ${item.is_completed ? "line-through text-muted-foreground" : ""}`}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => deleteCheckItem.mutate({ id: item.id, task_id: task.id })}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCheckItem();
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                value={newCheckItem}
                onChange={(e) => setNewCheckItem(e.target.value)}
                placeholder="Add item..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 border-none"
              />
            </form>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Attachments {attachments.length > 0 && `(${attachments.length})`}
            </label>

            <div className="space-y-1.5">
              {attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-3 bg-muted rounded-lg px-3 py-2 group">
                  {att.file_type?.startsWith("image/") ? (
                    <ImageIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-sm flex-1 truncate">{att.file_name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {att.file_size ? `${(att.file_size / 1024).toFixed(0)}KB` : ""}
                  </span>
                  <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => deleteAttachment.mutate({ id: att.id, task_id: task.id })}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Upload className="w-4 h-4" />
              {uploadAttachment.isPending ? "Uploading..." : "Attach file"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default TaskDetailSheet;
