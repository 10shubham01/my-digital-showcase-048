import { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { X, Plus, Trash2, GripVertical, Settings } from "lucide-react";
import { useProjectStatuses, useAddProjectStatus, useUpdateProjectStatus, useDeleteProjectStatus, type ProjectStatus } from "@/hooks/useProjectStatuses";
import type { Project } from "@/hooks/useProjects";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SettingsPanelProps {
  project: Project;
  onClose: () => void;
}

const PRESET_COLORS = [
  "#6b7280", "#6366f1", "#06b6d4", "#f97316", "#22c55e",
  "#ec4899", "#8b5cf6", "#ef4444", "#eab308", "#14b8a6",
];

const SettingsPanel = ({ project, onClose }: SettingsPanelProps) => {
  const { data: statuses = [] } = useProjectStatuses(project.id);
  const addStatus = useAddProjectStatus();
  const updateStatus = useUpdateProjectStatus();
  const deleteStatus = useDeleteProjectStatus();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[1]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newName.trim() || addStatus.isPending) return;
    const slug = newName.trim().toLowerCase().replace(/\s+/g, "_");
    await addStatus.mutateAsync({
      project_id: project.id,
      name: newName.trim(),
      slug,
      color: newColor,
      order: statuses.length,
    });
    setNewName("");
    setShowAdd(false);
  };

  const handleDelete = async (status: ProjectStatus) => {
    if (statuses.length <= 1) return;
    await deleteStatus.mutateAsync({ id: status.id, project_id: project.id });
    setDeleteConfirm(null);
  };

  const handleReorder = async (reordered: ProjectStatus[]) => {
    reordered.forEach((s, i) => {
      if (s.order !== i) {
        updateStatus.mutate({ id: s.id, project_id: project.id, order: i });
      }
    });
  };

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
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border overflow-y-auto"
      >
        <div className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold tracking-wide">Workflow Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 font-medium">
              Status Buckets
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Drag to reorder. Add or remove buckets to match your workflow.
            </p>

            <Reorder.Group axis="y" values={statuses} onReorder={handleReorder} className="space-y-2">
              {statuses.map((status) => (
                <Reorder.Item
                  key={status.id}
                  value={status}
                  className="flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-3 cursor-grab active:cursor-grabbing group"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }} />
                  <span className="flex-1 text-sm font-medium">{status.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{status.slug}</span>
                  {statuses.length > 1 && (
                    <Popover open={deleteConfirm === status.id} onOpenChange={(open) => setDeleteConfirm(open ? status.id : null)}>
                      <PopoverTrigger asChild>
                        <button className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-56 p-3">
                        <p className="text-sm mb-3">Delete "{status.name}"?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(status)}
                            className="flex-1 bg-destructive text-destructive-foreground text-xs py-2 rounded-lg font-medium"
                          >
                            Delete
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-muted text-xs py-2 rounded-lg">
                            Cancel
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          {/* Add bucket - popover */}
          <Popover open={showAdd} onOpenChange={setShowAdd}>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                <Plus className="w-4 h-4" /> Add Bucket
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-3">
              <p className="text-xs font-mono text-muted-foreground mb-2">NEW BUCKET</p>
              <div className="space-y-3">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="Status name (e.g. QA Testing)"
                  className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  autoFocus
                />
                <div className="flex gap-1.5 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${newColor === c ? "scale-125 ring-2 ring-ring ring-offset-2 ring-offset-background" : "hover:scale-110"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAdd}
                    disabled={addStatus.isPending || !newName.trim()}
                    className="flex-1 bg-foreground text-background rounded-lg py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {addStatus.isPending ? "Adding..." : "Add Bucket"}
                  </button>
                  <button onClick={() => setShowAdd(false)} className="px-4 text-sm text-muted-foreground">
                    Cancel
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </motion.div>
    </>
  );
};

export default SettingsPanel;
