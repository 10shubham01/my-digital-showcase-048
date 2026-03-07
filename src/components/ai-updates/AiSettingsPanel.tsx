import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, Plus, Trash2, Settings } from "lucide-react";
import { useAiSettings, useUpdateAiSettings } from "@/hooks/useAiSettings";
import { toast } from "sonner";

interface AiSettingsPanelProps {
  onClose: () => void;
}

const MODELS = [
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", desc: "Fast & balanced" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", desc: "Best quality" },
  { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash", desc: "Latest preview" },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini", desc: "Strong reasoning" },
  { value: "openai/gpt-5", label: "GPT-5", desc: "Most powerful" },
];

const AiSettingsPanel = ({ onClose }: AiSettingsPanelProps) => {
  const { data: settings, isLoading } = useAiSettings();
  const updateSettings = useUpdateAiSettings();

  const [form, setForm] = useState({
    allowed_email: "",
    system_prompt: "",
    model: "google/gemini-2.5-flash",
    generation_interval_hours: 24,
    news_sources: [] as string[],
    template_style: "modern-dark",
  });

  const [newSource, setNewSource] = useState("");

  useEffect(() => {
    if (settings) {
      setForm({
        allowed_email: settings.allowed_email,
        system_prompt: settings.system_prompt,
        model: settings.model,
        generation_interval_hours: settings.generation_interval_hours,
        news_sources: settings.news_sources || [],
        template_style: settings.template_style,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    if (!settings) return;
    await updateSettings.mutateAsync({ id: settings.id, ...form } as any);
    toast.success("Settings saved");
  };

  const addSource = () => {
    if (!newSource.trim()) return;
    setForm((p) => ({ ...p, news_sources: [...p.news_sources, newSource.trim()] }));
    setNewSource("");
  };

  const removeSource = (i: number) => {
    setForm((p) => ({ ...p, news_sources: p.news_sources.filter((_, j) => j !== i) }));
  };

  if (isLoading) return null;

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
        <div className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">AI Settings</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={updateSettings.isPending}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" /> {updateSettings.isPending ? "Saving..." : "Save"}
            </button>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Access Control */}
          <section className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">Access Control</h3>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Allowed Email (only this email can access)</label>
              <input
                value={form.allowed_email}
                onChange={(e) => setForm((p) => ({ ...p, allowed_email: e.target.value }))}
                className="w-full bg-muted/50 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                placeholder="your@email.com"
              />
            </div>
          </section>

          {/* AI Model */}
          <section className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">AI Model</h3>
            <div className="grid gap-2">
              {MODELS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setForm((p) => ({ ...p, model: m.value }))}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    form.model === m.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-foreground/20"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full border-2 ${
                      form.model === m.value ? "border-primary bg-primary" : "border-muted-foreground"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">{m.label}</p>
                    <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* System Prompt */}
          <section className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">System Prompt</h3>
            <textarea
              value={form.system_prompt}
              onChange={(e) => setForm((p) => ({ ...p, system_prompt: e.target.value }))}
              className="w-full bg-muted/50 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring resize-none min-h-[120px]"
              rows={6}
            />
          </section>

          {/* Generation Interval */}
          <section className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">Generation Interval</h3>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={168}
                value={form.generation_interval_hours}
                onChange={(e) => setForm((p) => ({ ...p, generation_interval_hours: parseInt(e.target.value) || 24 }))}
                className="w-20 bg-muted/50 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
              <span className="text-sm text-muted-foreground">hours between posts</span>
            </div>
          </section>

          {/* News Sources */}
          <section className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">News Sources</h3>
            <p className="text-[10px] text-muted-foreground">Domains to scrape for AI/tech news</p>
            <div className="space-y-2">
              {form.news_sources.map((s, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                  <span className="flex-1 text-sm font-mono">{s}</span>
                  <button onClick={() => removeSource(i)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSource()}
                  placeholder="blog.google.com"
                  className="flex-1 bg-muted/50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  onClick={addSource}
                  className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Template Style */}
          <section className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">Template Style</h3>
            <div className="grid grid-cols-2 gap-2">
              {["modern-dark", "minimal-light", "gradient-neon", "editorial"].map((style) => (
                <button
                  key={style}
                  onClick={() => setForm((p) => ({ ...p, template_style: style }))}
                  className={`px-4 py-3 rounded-xl border text-sm capitalize transition-all ${
                    form.template_style === style
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border hover:border-foreground/20"
                  }`}
                >
                  {style.replace("-", " ")}
                </button>
              ))}
            </div>
          </section>
        </div>
      </motion.div>
    </>
  );
};

export default AiSettingsPanel;
