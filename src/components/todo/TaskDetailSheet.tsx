import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Paperclip, Check, Upload, FileText, Image as ImageIcon, Download, Calendar as CalendarIcon, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";
import {
  useChecklist, useAddChecklistItem, useToggleChecklistItem, useDeleteChecklistItem,
  useAttachments, useUploadAttachment, useDeleteAttachment,
  useUpdateTask, useDeleteTask,
  type Task, type TaskPriority,
} from "@/hooks/useTasks";
import type { ProjectStatus } from "@/hooks/useProjectStatuses";
import { useProjects } from "@/hooks/useProjects";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import LinkText from "./LinkText";

interface TaskDetailSheetProps {
  task: Task;
  statuses: ProjectStatus[];
  onClose: () => void;
}

const PRIORITIES: { key: TaskPriority; label: string; num: string }[] = [
  { key: "urgent", label: "Urgent", num: "P1" },
  { key: "high", label: "High", num: "P2" },
  { key: "medium", label: "Medium", num: "P3" },
  { key: "low", label: "Low", num: "P4" },
];

const TaskDetailSheet = ({ task, statuses, onClose }: TaskDetailSheetProps) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [newCheckItem, setNewCheckItem] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: checklist = [] } = useChecklist(task.id);
  const addCheckItem = useAddChecklistItem();
  const toggleCheckItem = useToggleChecklistItem();
  const deleteCheckItem = useDeleteChecklistItem();
  const { data: attachments = [] } = useAttachments(task.id);
  const uploadAttachment = useUploadAttachment();
  const deleteAttachment = useDeleteAttachment();
  const { data: projects = [] } = useProjects();

  const currentStatus = statuses.find((s) => s.slug === task.status);

  // Auto-grow textarea
  const autoGrow = useCallback(() => {
    if (descRef.current) {
      descRef.current.style.height = "auto";
      descRef.current.style.height = descRef.current.scrollHeight + "px";
    }
  }, []);

  useEffect(() => { autoGrow(); }, [description, autoGrow]);

  // Sync props
  useEffect(() => { setTitle(task.title); }, [task.title]);
  useEffect(() => { setDescription(task.description || ""); }, [task.description]);

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

  const handleTransfer = (projectId: string) => {
    updateTask.mutate({ id: task.id, project_id: projectId } as any);
    setShowTransfer(false);
  };

  const completedCount = checklist.filter((c) => c.is_completed).length;
  const dueDate = task.due_date ? new Date(task.due_date) : undefined;
  const otherProjects = projects.filter((p) => p.id !== task.project_id);

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
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentStatus?.color || "#6b7280" }} />
            <span className="text-xs font-mono text-muted-foreground">{task.id.slice(0, 8)}</span>
          </div>
          <div className="flex items-center gap-1">
            {otherProjects.length > 0 && (
              <Popover open={showTransfer} onOpenChange={setShowTransfer}>
                <PopoverTrigger asChild>
                  <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Transfer to project">
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-2">
                  <p className="text-xs font-mono text-muted-foreground px-2 py-1 mb-1">TRANSFER TO</p>
                  {otherProjects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleTransfer(p.id)}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            )}
            <Popover open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <PopoverTrigger asChild>
                <button className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 p-3">
                <p className="text-sm font-medium mb-3">Delete this task?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      deleteTask.mutate({ id: task.id, projectId: task.project_id });
                      onClose();
                    }}
                    className="flex-1 bg-destructive text-destructive-foreground text-xs py-2 rounded-lg font-medium"
                  >
                    Delete
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-muted text-xs py-2 rounded-lg">
                    Cancel
                  </button>
                </div>
              </PopoverContent>
            </Popover>
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

          {/* Status */}
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
                  style={{ backgroundColor: s.color + "18", color: s.color }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Priority - numeric */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Priority</label>
            <div className="flex gap-1.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p.key}
                  onClick={() => saveField("priority", p.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    task.priority === p.key ? "bg-muted ring-1 ring-foreground/20 text-foreground" : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {p.num}
                </button>
              ))}
            </div>
          </div>

          {/* Due date - proper calendar */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Due Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-2 text-sm py-2 px-1 rounded-lg transition-colors hover:bg-muted/50 w-full text-left",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="w-4 h-4 opacity-50" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => saveField("due_date", date ? format(date, "yyyy-MM-dd") : null)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description - auto-grow, no background */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Description</label>
            <textarea
              ref={descRef}
              value={description}
              onChange={(e) => { setDescription(e.target.value); autoGrow(); }}
              onBlur={() => description !== (task.description || "") && saveField("description", description)}
              placeholder="Add a description..."
              className="w-full bg-transparent px-1 py-1 text-sm outline-none resize-none border-none min-h-[40px] overflow-hidden"
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
                    <LinkText text={item.text} />
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

            <form onSubmit={(e) => { e.preventDefault(); handleAddCheckItem(); }} className="flex items-center gap-2">
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

            <div className="space-y-2">
              {attachments.map((att) => (
                <div key={att.id} className="group">
                  {att.file_type?.startsWith("image/") && (
                    <div
                      className="rounded-lg overflow-hidden mb-1 cursor-pointer border border-border/50 hover:border-border transition-colors"
                      onClick={() => setPreviewImage(att.file_url)}
                    >
                      <img
                        src={att.file_url}
                        alt={att.file_name}
                        className="w-full h-32 object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3 px-1 py-1.5">
                    {!att.file_type?.startsWith("image/") && (
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="text-xs flex-1 truncate text-muted-foreground">{att.file_name}</span>
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
                </div>
              ))}
            </div>

            <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAttachment.isPending}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploadAttachment.isPending ? "Uploading..." : "Attach file"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Image preview overlay */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-8 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TaskDetailSheet;
