import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Plus, Trash2, Save, Download, Package, Instagram, Loader2 } from "lucide-react";
import type { AiPost, AiPostSlide } from "@/hooks/useAiPosts";
import { useUpdateAiPost } from "@/hooks/useAiPosts";
import CarouselSlide from "./CarouselSlide";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PostEditorProps {
  post: AiPost;
  onClose: () => void;
}

const ACCENT_PRESETS = ["#6366f1", "#06b6d4", "#f97316", "#22c55e", "#ec4899", "#ef4444", "#8b5cf6", "#eab308"];

const PostEditor = ({ post, onClose }: PostEditorProps) => {
  const [title, setTitle] = useState(post.title);
  const [summary, setSummary] = useState(post.summary || "");
  const [hashtags, setHashtags] = useState(post.hashtags.join(", "));
  const [slides, setSlides] = useState<AiPostSlide[]>(post.slides || []);
  const [activeSlide, setActiveSlide] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const updatePost = useUpdateAiPost();
  const slideRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[activeSlide];

  const updateSlide = (field: string, value: any) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === activeSlide ? { ...s, [field]: value } : s))
    );
  };

  const addSlide = () => {
    const newSlide: AiPostSlide = {
      type: "news",
      headline: "New Slide",
      bullets: ["Point 1"],
      accent_color: ACCENT_PRESETS[slides.length % ACCENT_PRESETS.length],
    };
    setSlides((prev) => [...prev.slice(0, -1), newSlide, ...prev.slice(-1)]);
    setActiveSlide(slides.length - 1);
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 2) return;
    setSlides((prev) => prev.filter((_, i) => i !== index));
    setActiveSlide((p) => Math.min(p, slides.length - 2));
  };

  const handleSave = async () => {
    await updatePost.mutateAsync({
      id: post.id,
      title,
      summary,
      hashtags: hashtags.split(",").map((t) => t.trim().replace(/^#/, "")),
      slides: slides as any,
      status: "draft",
    } as any);
    toast.success("Post saved as draft");
  };

  const renderSlideForExport = async (slideIndex: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      setActiveSlide(slideIndex);
      // Wait for render
      setTimeout(async () => {
        if (!slideRef.current) return reject("No ref");
        try {
          const dataUrl = await toPng(slideRef.current, { pixelRatio: 3 });
          resolve(dataUrl);
        } catch (e) {
          reject(e);
        }
      }, 300);
    });
  };

  const handleExportZip = async () => {
    if (!slideRef.current) return;
    setExporting(true);
    const originalSlide = activeSlide;

    try {
      const zip = new JSZip();
      const imgFolder = zip.folder("slides")!;

      // Export each slide
      for (let i = 0; i < slides.length; i++) {
        const dataUrl = await renderSlideForExport(i);
        const base64 = dataUrl.split(",")[1];
        imgFolder.file(`slide-${String(i + 1).padStart(2, "0")}.png`, base64, { base64: true });
      }

      // Create caption text file
      const hashtagStr = hashtags
        .split(",")
        .map((t) => `#${t.trim().replace(/^#/, "")}`)
        .join(" ");

      const captionContent = [
        `Title: ${title}`,
        "",
        `Caption:`,
        summary,
        "",
        `Hashtags:`,
        hashtagStr,
        "",
        `Slides:`,
        ...slides.map((s, i) => {
          let text = `\n--- Slide ${i + 1} (${s.type}) ---`;
          text += `\nHeadline: ${s.headline}`;
          if (s.subheadline) text += `\nSubheadline: ${s.subheadline}`;
          if (s.bullets?.length) text += `\nBullets:\n${s.bullets.map((b) => `  - ${b}`).join("\n")}`;
          if (s.source) text += `\nSource: ${s.source}`;
          return text;
        }),
        "",
        `Source URLs:`,
        ...(post.source_urls || []).map((u) => `  ${u}`),
        "",
        `Generated: ${new Date(post.created_at).toISOString()}`,
      ].join("\n");

      zip.file("caption.txt", captionContent);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40)}_slides.zip`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      setActiveSlide(originalSlide);
      toast.success("Exported zip with all slides and caption!");
    } catch (e) {
      console.error("Export error:", e);
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handlePublishToInstagram = async () => {
    setPublishing(true);
    try {
      // First export all slides as images
      const imageDataUrls: string[] = [];
      for (let i = 0; i < slides.length; i++) {
        const dataUrl = await renderSlideForExport(i);
        imageDataUrls.push(dataUrl);
      }

      const hashtagStr = hashtags
        .split(",")
        .map((t) => `#${t.trim().replace(/^#/, "")}`)
        .join(" ");

      const caption = `${summary}\n\n${hashtagStr}`;

      const { data, error } = await supabase.functions.invoke("publish-to-instagram", {
        body: {
          post_id: post.id,
          caption,
          image_data: imageDataUrls,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await updatePost.mutateAsync({
        id: post.id,
        status: "posted",
        posted_at: new Date().toISOString(),
      } as any);

      toast.success("Published to Instagram!");
    } catch (e: any) {
      toast.error(e.message || "Failed to publish");
    } finally {
      setPublishing(false);
      setActiveSlide(0);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 top-12 z-50 bg-background rounded-t-3xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold tracking-tight">Edit Post</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportZip}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium hover:bg-muted/80 transition-colors disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
              {exporting ? "Exporting..." : "Export Zip"}
            </button>
            <button
              onClick={handlePublishToInstagram}
              disabled={publishing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Instagram className="w-3.5 h-3.5" />}
              {publishing ? "Publishing..." : "Publish"}
            </button>
            <button
              onClick={handleSave}
              disabled={updatePost.isPending}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" /> {updatePost.isPending ? "Saving..." : "Save"}
            </button>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Preview */}
          <div className="flex-1 flex flex-col items-center justify-center bg-black/50 p-6">
            <div ref={slideRef}>
              {currentSlide && (
                <CarouselSlide slide={currentSlide} index={activeSlide} total={slides.length} />
              )}
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setActiveSlide((p) => Math.max(0, p - 1))}
                disabled={activeSlide === 0}
                className="p-2 rounded-full bg-white/10 text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-mono transition-all ${
                      i === activeSlide
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/10 text-white/50 hover:bg-white/20"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setActiveSlide((p) => Math.min(slides.length - 1, p + 1))}
                disabled={activeSlide === slides.length - 1}
                className="p-2 rounded-full bg-white/10 text-white disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Editor panel */}
          <div className="w-[380px] border-l border-border overflow-y-auto p-5 space-y-5">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Title</label>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold resize-none outline-none border-b border-border/50 focus:border-primary pb-2 transition-colors"
                rows={2}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Caption</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full bg-transparent text-xs resize-none outline-none border-b border-border/50 focus:border-primary pb-2 transition-colors"
                rows={3}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Hashtags</label>
              <input
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full bg-transparent text-xs outline-none border-b border-border/50 focus:border-primary pb-2 transition-colors"
                placeholder="ai, machinelearning, tech"
              />
            </div>

            <div className="h-px bg-border" />

            {currentSlide && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Slide {activeSlide + 1} -- {currentSlide.type}
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={addSlide}
                      className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    {slides.length > 2 && (
                      <button
                        onClick={() => removeSlide(activeSlide)}
                        className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Headline</label>
                  <input
                    value={currentSlide.headline}
                    onChange={(e) => updateSlide("headline", e.target.value)}
                    className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {(currentSlide.type === "cover" || currentSlide.type === "cta") && (
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Subheadline</label>
                    <input
                      value={currentSlide.subheadline || ""}
                      onChange={(e) => updateSlide("subheadline", e.target.value)}
                      className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                )}

                {currentSlide.type === "news" && (
                  <>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Source</label>
                      <input
                        value={currentSlide.source || ""}
                        onChange={(e) => updateSlide("source", e.target.value)}
                        className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Bullet points (max 4 shown on slide)
                      </label>
                      {(currentSlide.bullets || []).map((b, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            value={b}
                            onChange={(e) => {
                              const newBullets = [...(currentSlide.bullets || [])];
                              newBullets[i] = e.target.value;
                              updateSlide("bullets", newBullets);
                            }}
                            className="flex-1 bg-muted/50 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring"
                          />
                          <button
                            onClick={() => {
                              const newBullets = (currentSlide.bullets || []).filter((_, j) => j !== i);
                              updateSlide("bullets", newBullets);
                            }}
                            className="p-1.5 text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => updateSlide("bullets", [...(currentSlide.bullets || []), ""])}
                        className="text-xs text-primary hover:underline"
                      >
                        + Add bullet
                      </button>
                    </div>
                  </>
                )}

                {/* Image URL */}
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Image URL (optional)</label>
                  <input
                    value={currentSlide.image_url || ""}
                    onChange={(e) => updateSlide("image_url", e.target.value)}
                    className="w-full bg-muted/50 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-ring"
                    placeholder="https://..."
                  />
                </div>

                {/* Accent color */}
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Accent Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {ACCENT_PRESETS.map((c) => (
                      <button
                        key={c}
                        onClick={() => updateSlide("accent_color", c)}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          currentSlide.accent_color === c
                            ? "scale-125 ring-2 ring-ring ring-offset-2 ring-offset-background"
                            : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default PostEditor;
