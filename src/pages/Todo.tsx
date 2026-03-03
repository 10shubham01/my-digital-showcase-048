import { useState } from "react";
import { motion } from "framer-motion";
import { useTodoAuth } from "@/hooks/useTodoAuth";
import { useProjects } from "@/hooks/useProjects";
import TerminalLogin from "@/components/todo/TerminalLogin";
import ProjectSidebar from "@/components/todo/ProjectSidebar";
import TaskBoard from "@/components/todo/TaskBoard";

const Todo = () => {
  const { session, loading, signIn, signUp, signOut } = useTodoAuth();
  const { data: projects = [] } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Auto-select first project
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full"
        />
      </div>
    );
  }

  if (!session) {
    return <TerminalLogin onLogin={signIn} onSignUp={signUp} />;
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <ProjectSidebar
        selectedProject={selectedProject?.id || null}
        onSelectProject={setSelectedProjectId}
        onSignOut={signOut}
      />
      {selectedProject ? (
        <TaskBoard project={selectedProject} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="text-6xl mb-4 block">📋</span>
            <h2 className="font-heading text-3xl mb-2">Welcome to your workspace</h2>
            <p className="text-muted-foreground text-sm">Create a project to get started</p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Todo;
