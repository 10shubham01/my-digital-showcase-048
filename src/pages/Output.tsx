import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Sparkles, LogOut, Loader2, Zap, BarChart3, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useTodoAuth } from "@/hooks/useTodoAuth";
import { useAiPosts, useGeneratePost, type AiPost } from "@/hooks/useAiPosts";
import { useAiSettings } from "@/hooks/useAiSettings";
import PostGallery from "@/components/ai-updates/PostGallery";
import PostEditor from "@/components/ai-updates/PostEditor";
import AiSettingsPanel from "@/components/ai-updates/AiSettingsPanel";
import GenerationProgress from "@/components/ai-updates/GenerationProgress";
import ThemeToggle from "@/components/ThemeToggle";
import TerminalLogin from "@/components/todo/TerminalLogin";
import { toast } from "sonner";

const fontFamily = "'Montserrat Alternates', sans-serif";

const Output = () => {
  const { session, loading: authLoading, signIn, signUp, signOut } = useTodoAuth();
  const { data: settings, isLoading: settingsLoading } = useAiSettings();
  const { data: posts = [], isLoading: postsLoading } = useAiPosts();
  const generatePost = useGeneratePost();

  const [showSettings, setShowSettings] = useState(false);
  const [editingPost, setEditingPost] = useState<AiPost | null>(null);
  const [showGenProgress, setShowGenProgress] = useState(false);
  const [genSuccess, setGenSuccess] = useState(false);

  const handleGenComplete = useCallback(() => {
    setShowGenProgress(false);
    setGenSuccess(false);
    toast.success("New post generated!");
  }, []);

  const isAllowed = !settingsLoading && settings && (
    !settings.allowed_email || settings.allowed_email === "" || session?.user?.email === settings.allowed_email
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" style={{ fontFamily }}>
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <TerminalLogin onLogin={signIn} onSignUp={signUp} />;
  }

  if (!settingsLoading && !isAllowed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" style={{ fontFamily }}>
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold">Access Denied</p>
          <p className="text-sm text-muted-foreground">This page is restricted.</p>
          <button onClick={signOut} className="text-xs text-primary hover:underline">Sign out</button>
        </div>
      </div>
    );
  }

  const pendingCount = posts.filter((p) => p.status === "pending").length;
  const approvedCount = posts.filter((p) => p.status === "approved").length;
  const rejectedCount = posts.filter((p) => p.status === "rejected").length;
  const totalCount = posts.length;

  const handleGenerate = async () => {
    setShowGenProgress(true);
    setGenSuccess(false);
    try {
      await generatePost.mutateAsync();
      setGenSuccess(true);
    } catch (e: any) {
      setShowGenProgress(false);
      toast.error(e.message || "Generation failed");
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily }}>
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-grid opacity-40 pointer-events-none" />

      {/* Minimal top bar */}
      <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-2xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
            >
              <Zap className="w-5 h-5 text-primary" />
            </motion.div>
            <h1 className="text-sm font-bold tracking-tight uppercase">justoutput</h1>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={generatePost.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {generatePost.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              Generate
            </motion.button>
            <ThemeToggle />
            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={signOut}
              className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Stats row */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-2">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total", value: totalCount, icon: BarChart3, color: "text-foreground" },
            { label: "Pending", value: pendingCount, icon: Clock, color: "text-amber-500" },
            { label: "Approved", value: approvedCount, icon: CheckCircle2, color: "text-emerald-500" },
            { label: "Rejected", value: rejectedCount, icon: XCircle, color: "text-red-500" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative group"
            >
              <div className="p-4 rounded-2xl bg-card/50 border border-border/50 hover:border-border transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6 relative">
        {postsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">No posts yet</p>
            <p className="text-xs text-muted-foreground/60">Click "Generate" to create your first AI post</p>
          </motion.div>
        ) : (
          <PostGallery posts={posts} onEdit={setEditingPost} />
        )}
      </div>

      {/* Panels */}
      <AnimatePresence>
        {showSettings && <AiSettingsPanel onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {editingPost && <PostEditor post={editingPost} onClose={() => setEditingPost(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        <GenerationProgress isGenerating={showGenProgress} isSuccess={genSuccess} onComplete={handleGenComplete} />
      </AnimatePresence>
    </div>
  );
};

export default Output;
