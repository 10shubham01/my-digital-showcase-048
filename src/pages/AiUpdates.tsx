import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Sparkles, LayoutGrid, Clock, LogOut, Loader2, Zap } from "lucide-react";
import { useTodoAuth } from "@/hooks/useTodoAuth";
import { useAiPosts, useGeneratePost, type AiPost } from "@/hooks/useAiPosts";
import { useAiSettings } from "@/hooks/useAiSettings";
import PostGallery from "@/components/ai-updates/PostGallery";
import PostEditor from "@/components/ai-updates/PostEditor";
import AiSettingsPanel from "@/components/ai-updates/AiSettingsPanel";
import GenerationProgress from "@/components/ai-updates/GenerationProgress";
import { toast } from "sonner";

const AiUpdates = () => {
  const { session, loading: authLoading, signIn, signOut } = useTodoAuth();
  const { data: settings, isLoading: settingsLoading } = useAiSettings();
  const { data: posts = [], isLoading: postsLoading } = useAiPosts();
  const generatePost = useGeneratePost();

  const [view, setView] = useState<"dashboard" | "gallery">("dashboard");
  const [showSettings, setShowSettings] = useState(false);
  const [editingPost, setEditingPost] = useState<AiPost | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showGenProgress, setShowGenProgress] = useState(false);
  const [genSuccess, setGenSuccess] = useState(false);

  const handleGenComplete = useCallback(() => {
    setShowGenProgress(false);
    setGenSuccess(false);
    toast.success("New post generated!");
  }, []);

  // Access check
  const isAllowed = !settingsLoading && settings && (
    !settings.allowed_email || settings.allowed_email === "" || session?.user?.email === settings.allowed_email
  );

  // Login screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" style={{ fontFamily: "'Montserrat Alternates', sans-serif" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">AI Updates</h1>
            <p className="text-sm text-muted-foreground">Sign in to access the content studio</p>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setLoginLoading(true);
              const { error } = await signIn(loginEmail, loginPassword);
              if (error) toast.error(error.message);
              setLoginLoading(false);
            }}
            className="space-y-3"
          >
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
            />
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
            />
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (!settingsLoading && !isAllowed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" style={{ fontFamily: "'Montserrat Alternates', sans-serif" }}>
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
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Montserrat Alternates', sans-serif" }}>
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold tracking-tight">AI Updates Studio</h1>
            </div>
            <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 ml-4">
              <button
                onClick={() => setView("dashboard")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  view === "dashboard" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Dashboard
              </button>
              <button
                onClick={() => setView("gallery")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  view === "gallery" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Gallery
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={generatePost.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg shadow-primary/20"
            >
              {generatePost.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              Generate Post
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={signOut}
              className="p-2.5 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-4">
          {[
            { label: "Total Posts", value: totalCount, color: "#6366f1" },
            { label: "Pending Review", value: pendingCount, color: "#f59e0b" },
            { label: "Approved", value: approvedCount, color: "#22c55e" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card border border-border"
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {postsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {view === "dashboard" && (
              <div className="space-y-6">
                {pendingCount > 0 && (
                  <div>
                    <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4">
                      Awaiting Review ({pendingCount})
                    </h2>
                    <PostGallery
                      posts={posts.filter((p) => p.status === "pending")}
                      onEdit={setEditingPost}
                    />
                  </div>
                )}
                {posts.filter((p) => p.status !== "pending").length > 0 && (
                  <div>
                    <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4">
                      Recent Posts
                    </h2>
                    <PostGallery
                      posts={posts.filter((p) => p.status !== "pending").slice(0, 9)}
                      onEdit={setEditingPost}
                    />
                  </div>
                )}
                {posts.length === 0 && (
                  <div className="text-center py-20">
                    <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">No posts yet. Click "Generate Post" to create your first one.</p>
                  </div>
                )}
              </div>
            )}
            {view === "gallery" && <PostGallery posts={posts} onEdit={setEditingPost} />}
          </>
        )}
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && <AiSettingsPanel onClose={() => setShowSettings(false)} />}
      </AnimatePresence>

      {/* Post editor */}
      <AnimatePresence>
        {editingPost && <PostEditor post={editingPost} onClose={() => setEditingPost(null)} />}
      </AnimatePresence>

      {/* Generation progress */}
      <AnimatePresence>
        <GenerationProgress
          isGenerating={showGenProgress}
          isSuccess={genSuccess}
          onComplete={handleGenComplete}
        />
      </AnimatePresence>
    </div>
  );
};

export default AiUpdates;
