import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTodoAuth } from "@/hooks/useTodoAuth";
import { useProjects } from "@/hooks/useProjects";
import TerminalLogin from "@/components/todo/TerminalLogin";
import ProjectSidebar from "@/components/todo/ProjectSidebar";
import TaskBoard from "@/components/todo/TaskBoard";
import SettingsPanel from "@/components/todo/SettingsPanel";

const Todo = () => {
  const { session, loading, signIn, signUp, signOut } = useTodoAuth();
  const { data: projects = [] } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" style={{ fontFamily: "'Montserrat Alternates', sans-serif" }}>
        <div className="flex flex-col items-center gap-4">
          <motion.div className="relative w-12 h-12">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-foreground/10"
              style={{ borderTopColor: "hsl(var(--accent-pop))" }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-1 rounded-full border-2 border-foreground/5"
              style={{ borderBottomColor: "hsl(var(--accent-cyan))" }}
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-muted-foreground font-mono tracking-widest"
          >
            LOADING WORKSPACE...
          </motion.p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ fontFamily: "'Montserrat Alternates', sans-serif" }}>
        <TerminalLogin onLogin={signIn} onSignUp={signUp} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden" style={{ fontFamily: "'Montserrat Alternates', sans-serif" }}>
      <ProjectSidebar
        selectedProject={selectedProject?.id || null}
        onSelectProject={setSelectedProjectId}
        onSignOut={signOut}
        onOpenSettings={() => setShowSettings(true)}
      />
      {selectedProject ? (
        <TaskBoard project={selectedProject} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="text-6xl mb-4 block">📋</span>
            <h2 className="text-3xl font-semibold mb-2">Welcome to your workspace</h2>
            <p className="text-muted-foreground text-sm">Create a project to get started</p>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showSettings && selectedProject && (
          <SettingsPanel project={selectedProject} onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Todo;
