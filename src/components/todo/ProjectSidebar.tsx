import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, LogOut, FolderKanban, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { useProjects, useCreateProject, useDeleteProject } from "@/hooks/useProjects";
import FolderIcon from "./FolderIcon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ProjectSidebarProps {
  selectedProject: string | null;
  onSelectProject: (id: string) => void;
  onSignOut: () => void;
  onOpenSettings: () => void;
}

const PROJECT_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#06b6d4",
];

const ProjectSidebar = ({ selectedProject, onSelectProject, onSignOut, onOpenSettings }: ProjectSidebarProps) => {
  const { data: projects = [] } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [collapsed, setCollapsed] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim() || createProject.isPending) return;
    await createProject.mutateAsync({ name: name.trim(), color, icon: "📁" });
    setName("");
    setShowCreate(false);
  };

  return (
    <motion.div
      animate={{ width: collapsed ? 64 : 280 }}
      className="h-full border-r border-border bg-card/50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5" style={{ color: "hsl(var(--accent-pop))" }} />
            <span className="text-lg font-semibold tracking-wide">Projects</span>
          </motion.div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground p-1">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {projects.map((p) => (
          <motion.button
            key={p.id}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectProject(p.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left group ${
              selectedProject === p.id
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <FolderIcon color={p.color} size={18} />
            {!collapsed && (
              <>
                <span className="flex-1 truncate text-sm font-medium">{p.name}</span>
                <Popover open={deleteConfirm === p.id} onOpenChange={(open) => setDeleteConfirm(open ? p.id : null)}>
                  <PopoverTrigger asChild>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(p.id); }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-52 p-3" onClick={(e) => e.stopPropagation()}>
                    <p className="text-sm font-medium mb-3">Delete "{p.name}"?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteProject.mutate(p.id); setDeleteConfirm(null); }}
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
              </>
            )}
          </motion.button>
        ))}
      </div>

      {/* Create project - popover */}
      {!collapsed && (
        <div className="p-3 border-t border-border">
          <Popover open={showCreate} onOpenChange={setShowCreate}>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                <Plus className="w-4 h-4" /> New Project
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-64 p-3">
              <p className="text-xs font-mono text-muted-foreground mb-2">NEW PROJECT</p>
              <div className="space-y-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="Project name"
                  className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  autoFocus
                />
                <div className="flex gap-1.5 flex-wrap">
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-5 h-5 rounded-full transition-transform ${color === c ? "scale-125 ring-2 ring-ring" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    disabled={createProject.isPending || !name.trim()}
                    className="flex-1 bg-foreground text-background rounded-lg py-1.5 text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {createProject.isPending ? "Creating..." : "Create"}
                  </button>
                  <button onClick={() => setShowCreate(false)} className="px-3 text-xs text-muted-foreground">
                    Cancel
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Bottom actions */}
      <div className="p-3 border-t border-border space-y-1">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="w-4 h-4" />
          {!collapsed && "Settings"}
        </button>
        <button
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </motion.div>
  );
};

export default ProjectSidebar;
